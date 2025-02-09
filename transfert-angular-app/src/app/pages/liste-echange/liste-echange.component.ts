import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { EchangeService } from '../../services/echanges/echange.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { DeviseService } from '../../services/devise/devise.service';

@Component({
  selector: 'app-liste-echange',
 standalone: true,
 imports: [CommonModule, ReactiveFormsModule, FormsModule, DataTablesModule],
  templateUrl: './liste-echange.component.html',
  styleUrl: './liste-echange.component.css'
})

export class ListeEchangeComponent implements OnInit {
  // Informations de l'utilisateur connecté
  userInfo: any = null;
  idUser: string = '';

  // Tableau pour stocker les résultats des entrées
  allresultat: any[] = [];

  // Formulaire pour ajouter une entrée
  echangeForm!: FormGroup;

  isLoading: boolean = false;

  dtoptions: any = {};

  dtTrigger: Subject<any> = new Subject<any>();

  // Injection des dépendances nécessaires
  constructor(
    private echangeService: EchangeService,
    private authService: AuthService,
    private deviseService: DeviseService,
    private fb: FormBuilder
  ) { }

  // Initialisation du composant
  ngOnInit(): void {
    this.dtoptions = {
      paging: true, // Activer la pagination
      pagingType: 'full_numbers', // Type de pagination
      pageLength: 10 // Nombre d'éléments par page
    };
    this.initForm(); // Initialisation du formulaire
    this.fetchAllEchange(); // Récupération des données existantes
    this.fetchDevise();
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
          this.echangeForm.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
  }

  // Méthode pour soumettre le formulaire et ajouter une nouvelle entrée
  ajouterEchange(): void {
    console.log( this.echangeForm.value);
    if (this.echangeForm.valid) {
      this.isLoading = true;
      const formData = this.echangeForm.value; // Récupérer les valeurs du formulaire
      this.echangeService.ajouterEchange(formData).subscribe({
        next: (response) => {
          console.log('Echange ajoutée avec succès:', response);
          this.fetchAllEchange();
          // Réinitialiser le formulaire et mettre à jour la liste
          this.echangeForm.patchValue({
            deviseId: '',
            nom: '',
            montant_devise: '',
          }); 
          this.isLoading = false;
          alert('Echange ajoutée avec succès !');
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Erreur lors de l\'ajout de l\'echange:', error);
          alert('Erreur lors de l\'ajout de l\'echange.');
        },
      });
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

  // Initialisation du formulaire avec des validations
  private initForm(): void {
    this.echangeForm = this.fb.group({
      utilisateurId: [this.idUser], // Liaison utilisateurId
      deviseId: ['', Validators.required], // Initialisé à vide
      nom: ['', Validators.required],
      montant_devise: [0, Validators.required],
    });
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


  private fetchAllEchange(): void {
    this.echangeService.getAllEchange().subscribe({
      next: (response) => {
        this.allresultat = response;
  
        // Détruire l'ancienne instance de DataTable si elle existe
        if ($.fn.DataTable.isDataTable('#transactions-table')) {
          $('#transactions-table').DataTable().clear().destroy();
        }
  
        // Initialiser DataTable après un court délai
        setTimeout(() => {
          let table = $('#transactions-table').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            stateSave: true,
            destroy: true,
          });
  
          // Fonction de filtrage des dates
          $('#btnFilter').on('click', function () {
            let startDate = ($('#startDate').val() as string);
            let endDate = ($('#endDate').val() as string);
  
            // Convertir les dates en objets Date
            let startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
            let endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;
  
            // Filtrer les lignes du tableau
            table.rows().every(function () {
              let rowData = this.data();
              let dateStr = rowData[1]; // Date au format 'dd/MM/yyyy HH:mm'
  
              if (dateStr) {
                // Extraire la date et l'heure
                let [datePart, timePart] = dateStr.split(' ');
                let [day, month, year] = datePart.split('/').map(Number);
                let [hours, minutes] = timePart.split(':').map(Number);
  
                // Créer un objet Date
                let rowDate = new Date(year, month - 1, day, hours, minutes);
  
                // Vérifier si la date est dans la plage spécifiée
                if (
                  (!startDateObj || rowDate >= startDateObj) &&
                  (!endDateObj || rowDate <= endDateObj)
                ) {
                  $(this.node()).show(); // Afficher la ligne
                } else {
                  $(this.node()).hide(); // Cacher la ligne
                }
              }
            });
  
            table.draw(); // Rafraîchir le tableau
          });
        }, 100);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données:', error);
      },
    });
  }
  
}

