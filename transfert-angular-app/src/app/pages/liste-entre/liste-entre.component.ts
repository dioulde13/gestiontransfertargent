import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntreServiceService } from '../../services/entre/entre-service.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth-service.service';
import { DeviseService } from '../../services/devise/devise.service';
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';

import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';


@Component({
  selector: 'app-liste-entre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DataTablesModule],
  templateUrl: './liste-entre.component.html',
  styleUrls: ['./liste-entre.component.css']
})
export class ListeEntreComponent implements OnInit {
  // Informations de l'utilisateur connecté
  userInfo: any = null;
  idUser: string = '';

  // Tableau pour stocker les résultats des entrées
  allresultat: any[] = [];

  // Formulaire pour ajouter une entrée
  entreForm!: FormGroup;

  isLoading: boolean = false;

  dtoptions: any = {};

  dtTrigger: Subject<any> = new Subject<any>();

  // Injection des dépendances nécessaires
  constructor(
    private entreService: EntreServiceService,
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
    this.initForm(); // Initialisation du formulaire
    this.fetchAllEntrees(); // Récupération des données existantes
    this.fetchDevise();
    this.fetchPartenaire();
    this.getUserInfo(); // Récupération des infos utilisateur
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
          this.entreForm.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
  }

  // Méthode pour soumettre le formulaire et ajouter une nouvelle entrée
  ajouterEntree(): void {
    console.log(this.entreForm.value);
    if (this.entreForm.valid) {
      this.isLoading = true;
      const formData = this.entreForm.value; // Récupérer les valeurs du formulaire
      this.entreService.ajouterEntree(formData).subscribe({
        next: (response) => {
          console.log('Entrée ajoutée avec succès:', response);
          this.fetchAllEntrees();
          this.allresultat.unshift(response);  // Ajouter en haut du tableau (ou utilisez push pour le bas)
          // Réinitialiser le formulaire et mettre à jour la liste
          this.entreForm.patchValue({
            partenaireId: '',
            deviseId: '',
            expediteur: '',
            receveur: '',
            montant_cfa: '',
            telephone_receveur: ''
          });
          this.isLoading = false;
          alert('Entrée ajoutée avec succès !');
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur lors de l\'ajout de l\'entrée:', error);
          alert('Erreur lors de l\'ajout de l\'entrée.');
        },
      });
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

  // Initialisation du formulaire avec des validations
  private initForm(): void {
    this.entreForm = this.fb.group({
      utilisateurId: [this.idUser], // Liaison utilisateurId
      partenaireId: ['', Validators.required],
      deviseId: ['', Validators.required], // Initialisé à vide
      expediteur: ['', Validators.required],
      receveur: ['', Validators.required],
      montant_cfa: [0, Validators.required],
      telephone_receveur: ['', Validators.required],
    });
  }

  allPartenaire: any[] = [];

  // Récupération des devises
  fetchPartenaire(): void {
    this.partenaireService.getAllPartenaire().subscribe(
      (response) => {
        this.allPartenaire = response;
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
  private fetchAllEntrees(): void {
    const tableElement = $('#transactions-table');
  
    if ($.fn.DataTable.isDataTable(tableElement)) {
      tableElement.DataTable().clear().destroy();
    }
  
    this.entreService.getAllEntree().subscribe({
      next: (response) => {
        this.allresultat = response;
        console.log(this.allresultat);
  
        setTimeout(() => {
          const table = $('#transactions-table').DataTable(this.dtoptions);
          let startDateObj: Date | null = null;
          let endDateObj: Date | null = null;
  
          const calculateTotal = () => {
            let total = 0;
            table.rows(':visible').every(function () {
              const rowData = this.data();
              const montant = parseFloat(rowData[4]?.replace(/\s/g, '').replace(/,/g, '') || '0');
              total += montant;
            });
  
            $('#totalMontant').html(
              `<strong>Total Montant GNF :</strong> ${total.toLocaleString()} GNF`
            );
          };
  
          // Gestion du filtre par date
          $('#btnFilter').off('click').on('click', function () {
            const startDate = ($('#startDate').val() as string);
            const endDate = ($('#endDate').val() as string);
  
            startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
            endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;
  
            table.rows().every(function () {
              const rowData = this.data();
              const dateStr = rowData[1];
  
              if (dateStr) {
                const [datePart, timePart] = dateStr.split(' ');
                const [day, month, year] = datePart.split('/').map(Number);
                const [hours, minutes] = timePart.split(':').map(Number);
                const rowDate = new Date(year, month - 1, day, hours, minutes);
  
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
  
          // Calcul du total lors de la recherche
          table.on('search.dt', calculateTotal);
  
          $('#totalMontant').html(`<strong>Total Montant GNF :</strong> 0 GNF`);
        }, 200);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données:', error);
      },
    });
  }
  
  

}
