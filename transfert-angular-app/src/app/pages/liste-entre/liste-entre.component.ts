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
      paging: true, // Activer la pagination
      pagingType: 'full_numbers', // Type de pagination
      pageLength: 10 // Nombre d'éléments par page
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
    console.log( this.entreForm.value);
    if (this.entreForm.valid) {
      this.isLoading = true;
      const formData = this.entreForm.value; // Récupérer les valeurs du formulaire
      this.entreService.ajouterEntree(formData).subscribe({
        next: (response) => {
          console.log('Entrée ajoutée avec succès:', response);
          this.fetchAllEntrees();
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


  // Méthode pour récupérer toutes les entrées via l'API
  private fetchAllEntrees(): void {
    this.entreService.getAllEntree().subscribe({
      next: (response) => {
        this.allresultat = response;
        if (this.allresultat && this.allresultat.length > 0) {
          this.dtTrigger.next(null); // Initialisation de DataTables
        }
        console.log(this.allresultat);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données:', error);
      },
    });
  }
  

}
