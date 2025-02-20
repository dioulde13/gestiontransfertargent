import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SortieService } from '../../services/sortie/sortie.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { DeviseService } from '../../services/devise/devise.service';
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { response } from 'express';
import { error } from 'console';

@Component({
  selector: 'app-liste-sortie',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTablesModule],
  templateUrl: './liste-sortie.component.html',
  styleUrl: './liste-sortie.component.css'
})
export class ListeSortieComponent implements OnInit {
  // Tableau pour stocker les résultats des entrées
  allresultat: any[] = [];

  userInfo: any = null;
  idUser: string = '';

  // Formulaire pour ajouter une entrée
  sortieForm!: FormGroup;
  annulerForm!: FormGroup;

  dtoptions: any = {};

  dtTrigger: Subject<any> = new Subject<any>();

  // Injection des dépendances nécessaires
  constructor(
    private sortieService: SortieService,
    private authService: AuthService,
    private deviseService: DeviseService,
    private partenaireService: PartenaireServiceService,
    private fb: FormBuilder
  ) { }

  // Initialisation du composant
  ngOnInit(): void {

    this.dtoptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      dom: "<'row'<'col-sm-6 dt-buttons-left'B><'col-sm-6 text-end dt-search-right'f>>" + 
           "<'row'<'col-sm-12'tr>>" + 
           "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: ['csv', 'excel', 'print'],
      language: {
          search: "Rechercher"
      }
    };
    // Initialisation du formulaire
    this.initForm();
    // Récupération des données existantes via l'API
    this.fetchAllEntrees();
    this.getUserInfo(); // Récupération des infos utilisateur
    this.fetchAllEntrees(); // Récupération des données existantes
    this.fetchDevise();
    this.fetchPartenaire();
    this.annulerFormInitial();
  }

  private annulerFormInitial(): void{
    this.annulerForm = this.fb.group({
      codeAnnuler: ['', Validators.required]
    });
  }

  isLoadingAnnuler: boolean = false;

  annulerSortie(): void{
    this.isLoadingAnnuler = true;
    const { codeAnnuler } = this.annulerForm.value;
    this.sortieService.annulerSortie(codeAnnuler).subscribe({
      next: (response) =>{
        this.isLoadingAnnuler = false;
         alert(response.message);
      },
      error: (error) => {
        this.isLoadingAnnuler = false;
        alert(error.error.message);
      }
    });
  }

  allPartenaire: any[] = [];

  // Récupération des devises
  fetchPartenaire(): void {
    this.partenaireService.getAllPartenaire().subscribe(
      (response) => {
        this.allPartenaire = response;
        if (this.allPartenaire && this.allPartenaire.length > 0) {
          this.dtTrigger.next(null); // Initialisation de DataTables
        }
        console.log('Liste des partenaires:', this.allPartenaire);
      },
      (error) => {
        console.error('Erreur lors de la récupération des partenaires:', error);
      }
    );
  }

  allDevise: any[] = [];

  // Récupération des devises
  fetchDevise(): void {
    this.deviseService.getAllDevise().subscribe(
      (response) => {
        this.allDevise = response;
        console.log('Liste des devises:', this.allDevise);
      },
      (error) => {
        console.error('Erreur lors de la récupération des devises:', error);
      }
    );
  }

  getUserInfo() {
    this.authService.getUserInfo().subscribe(
      {
        next: (response) => {
          this.userInfo = response.user;
          //   if (this.userInfo) {
          this.idUser = this.userInfo.id;
          console.log('Informations utilisateur:', this.userInfo);
          // Mettre à jour le champ utilisateurId dans le formulaire
          this.sortieForm.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
  }


  // Initialiser le formulaire avec des validations
  private initForm() {
    this.sortieForm = this.fb.group({
      utilisateurId: [this.idUser], // Liaison utilisateurId
      partenaireId: ['', Validators.required],
      deviseId: ['', Validators.required], // Initialisé à vide
      expediteur: ['', Validators.required],
      codeEnvoyer: ['', Validators.required],
      receveur: ['', Validators.required],
      montant: [0, Validators.required],
      telephone_receveur: ['', Validators.required],
    });
  }

  // Méthode pour récupérer toutes les entrées via l'API
  private fetchAllEntrees(): void {
    this.sortieService.getAllSortie().subscribe({
      next: (response) => {
        // Mise à jour du tableau avec les résultats récupérés
        this.allresultat = response;
        console.log('Données récupérées avec succès:', this.allresultat);
          // Détruire l'ancienne instance de DataTable si elle existe
          if ($.fn.DataTable.isDataTable('#transactions-table')) {
            $('#transactions-table').DataTable().clear().destroy();
          }
    
          // Initialiser DataTable après un court délai
          setTimeout(() => {
            let table = $('#transactions-table').DataTable(this.dtoptions);
    
            const calculateTotal = () => {
              let total = 0;
              let visibleRows = table.rows(':visible').data().length; // Nombre de lignes visibles
    
              if (visibleRows > 0) {
                table.rows(':visible').every(function () {
                  let rowData = this.data();
                  let montant = parseFloat(
                    rowData[9].toString().replace(/\s/g, '').replace(/,/g, '')
                  ) || 0;
    
                  total += montant;
                });
              }
    
              // Afficher le total uniquement si un filtre est actif
              if (visibleRows > 0 && (startDateObj || endDateObj)) {
                $('#totalMontant').html(
                  `<strong>Total Montant GNF :</strong> ${total.toLocaleString()} GNF`
                );
              } else {
                $('#totalMontant').html(`<strong>Total Montant GNF :</strong> 0 GNF`);
              }
            };
    
            let startDateObj: Date | null = null;
            let endDateObj: Date | null = null;
    
            // Fonction de filtrage des dates
            $('#btnFilter').on('click', function () {
              let startDate = ($('#startDate').val() as string);
              let endDate = ($('#endDate').val() as string);
    
              startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
              endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;
    
              table.rows().every(function () {
                let rowData = this.data();
                let dateStr = rowData[0];
    
                if (dateStr) {
                  let [datePart, timePart] = dateStr.split(' ');
                  let [day, month, year] = datePart.split('/').map(Number);
                  let [hours, minutes] = timePart.split(':').map(Number);
                  let rowDate = new Date(year, month - 1, day, hours, minutes);
    
                  if (
                    (!startDateObj || rowDate >= startDateObj) &&
                    (!endDateObj || rowDate <= endDateObj)
                  ) {
                    $(this.node()).show();
                  } else {
                    $(this.node()).hide();
                  }
                }
              });
    
              table.draw();
              calculateTotal();
            });
    
            // Mettre à jour le total lors de la recherche
            table.on('search.dt', function () {
              calculateTotal();
            });
    
            // Afficher 0 par défaut
            $('#totalMontant').html(`<strong>Total Montant GNF :</strong> 0 GNF`);
          }, 100);
      },
      error: (error) => {
        // Gestion des erreurs lors de l'appel API
        console.error('Erreur lors de la récupération des données:', error);
      },
    });
  }

  loading: boolean = false;

  // Méthode pour soumettre le formulaire et ajouter une nouvelle entrée
  ajouterSortie(): void {
    console.log(this.sortieForm.value);
    if (this.sortieForm.valid) {
      this.loading = true;
      const formData = this.sortieForm.value; // Récupérer les valeurs du formulaire
      this.sortieService.ajouterSortie(formData).subscribe({
        next: (response) => {
          console.log('Sortie ajoutée avec succès:', response);
          this.fetchAllEntrees();
          // Réinitialiser le formulaire et mettre à jour la liste
          this.sortieForm.patchValue({
            partenaireId: '',
            deviseId: '',
            expediteur: '',
            codeEnvoyer: '',
            receveur: '',
            montant: '',
            telephone_receveur: ''
          }); 
          this.loading = false;
          alert(response.message);
        },
        error: (error) => {
          alert(error.error.message);
          this.loading = false;
        },
      });
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
