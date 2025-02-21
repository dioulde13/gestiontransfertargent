import { Component, OnInit , ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntreServiceService } from '../../services/entre/entre-service.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth-service.service';
import { DeviseService } from '../../services/devise/devise.service';
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';

import { Subject , Subscription} from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { NgxPrintModule } from 'ngx-print';



@Component({
  selector: 'app-liste-entre',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DataTablesModule, NgxPrintModule],
  templateUrl: './liste-entre.component.html',
  styleUrls: ['./liste-entre.component.css']
})
export class ListeEntreComponent implements OnInit {

  code: string = '';

  selectedRowId: number | null = null;

  @ViewChild('transactionsTable') table: any;

  // Sélectionner la ligne à imprimer
  printRow(user: any) {
    this.selectedRowId = user.id;
  }

  // Informations de l'utilisateur connecté
  userInfo: any = null;
  idUser: string = '';

  // Tableau pour stocker les résultats des entrées
  

  // Formulaire pour ajouter une entrée
  entreForm!: FormGroup;

  annulerEntreForm!: FormGroup;

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
  ) {
   }

  // Initialisation du composant
  ngOnInit(): void {
    this.dtoptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      order: [1,'desc'],
      dom: "<'row'<'col-sm-6 dt-buttons-left'B><'col-sm-6 text-end dt-search-right'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
      buttons: ['csv', 'excel', 'pdf', 'print', 'colvis'],
      language: {
        search: "Rechercher"
      }
    };
 
    this.initForm(); // Initialisation du formulaire
    this.fetchAllEntre(); // Récupération des données existantes
    this.fetchDevise();
    this.fetchPartenaire();
    this.getUserInfo(); // Récupération des infos utilisateur
    this.initAnnulerEntreForm();
  }

  private initAnnulerEntreForm(): void{
    this.annulerEntreForm = this.fb.group({
      codeAnnuler: ['', Validators.required],
      typeAnnuler: ['', Validators.required]
    });
  }


  isLoadingAnnuler: boolean = false;

  annulerEntre(): void {

    this.isLoadingAnnuler = true;
    const { codeAnnuler, typeAnnuler } = this.annulerEntreForm.value;

    this.entreService.annulerEntreParCode(codeAnnuler, typeAnnuler).subscribe(
      (response) => {
        console.log('Réponse du serveur:', response);
        this.isLoadingAnnuler = false;
        alert(response.message);
      },
      (error) => {
        console.error('Erreur:', error);
        this.isLoadingAnnuler = false;
        alert(error.error.message);
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
          this.entreForm.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
  }

  allresultat: any[] = [];

  // Méthode pour soumettre le formulaire et ajouter une nouvelle entrée
  ajouterEntree(): void {
    console.log(this.entreForm.value);
    // if (this.entreForm.valid) {
      this.isLoading = true;
      const formData = this.entreForm.value; // Récupérer les valeurs du formulaire
      console.log(formData);
      this.entreService.ajouterEntree(formData).subscribe({
        next: (response) => {
          console.log('Entrée ajoutée avec succès:', response);
          this.entreForm.patchValue({
            deviseId: '',
            partenaireId:'',
            expediteur: '',
            receveur: '',
            montant_cfa: '',
            telephone_receveur: ''
          });
          window.location.reload();
          this.isLoading = false;
          alert('Entrée ajoutée avec succès !');
        },
        error: (error) => {
          this.isLoading = false;
          console.error(error.error.message);
          alert(error.error.message);
        },
      });
    // } else {
    //   alert('Veuillez remplir tous les champs obligatoires.');
    // }
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

  private fetchAllEntre(): void {
    this.entreService.getAllEntree().subscribe({
      next: (response) => {
        this.allresultat = response;
        console.log(this.allresultat);
        // this.dtTrigger.next(null);
        // Détruire l'ancienne instance de DataTable si elle existe
        if ($.fn.DataTable.isDataTable('#transactions-table')) {
          $('#transactions-table').DataTable().clear().destroy();
        }

        // Initialiser DataTable après un court délai
        setTimeout(() => {
          let table = $('#transactions-table').DataTable(this.dtoptions);

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
