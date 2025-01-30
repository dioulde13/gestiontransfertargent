import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SortieService } from '../../services/sortie/sortie.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { DeviseService } from '../../services/devise/devise.service';
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';


@Component({
  selector: 'app-liste-sortie',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    // Initialisation du formulaire
    this.initForm();

    // Récupération des données existantes via l'API
    this.fetchAllEntrees();
    this.getUserInfo(); // Récupération des infos utilisateur
    this.fetchAllEntrees(); // Récupération des données existantes
    this.fetchDevise();
    this.fetchPartenaire();
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
      },
      error: (error) => {
        // Gestion des erreurs lors de l'appel API
        console.error('Erreur lors de la récupération des données:', error);
      },
    });
  }

  // Méthode pour soumettre le formulaire et ajouter une nouvelle entrée
  ajouterEntree(): void {
    console.log(this.sortieForm.value);
    if (this.sortieForm.valid) {
      const formData = this.sortieForm.value; // Récupérer les valeurs du formulaire
      this.sortieService.ajouterSortie(formData).subscribe({
        next: (response) => {
          console.log('Entrée ajoutée avec succès:', response);
          this.fetchAllEntrees();
          // Réinitialiser le formulaire et mettre à jour la liste
          this.sortieForm.patchValue({
            partenaireId: '',
            deviseId: '',
            expediteur: '',
            receveur: '',
            montant_cfa: '',
            telephone_receveur: ''
          }); 
          alert('Entrée ajoutée avec succès !');
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout de l\'entrée:', error);
          alert('Erreur lors de l\'ajout de l\'entrée.');
        },
      });
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
