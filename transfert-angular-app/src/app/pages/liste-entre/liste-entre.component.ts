import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntreServiceService } from '../../services/entre/entre-service.service';
import { FormBuilder, FormGroup,ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-liste-entre',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './liste-entre.component.html',
  styleUrls: ['./liste-entre.component.css']
})
export class ListeEntreComponent implements OnInit {
  // Tableau pour stocker les résultats des entrées
  allresultat: any[] = [];

  // Formulaire pour ajouter une entrée
  entreForm!: FormGroup;

  // Injection des dépendances nécessaires
  constructor(
    private entreService: EntreServiceService,
    private fb: FormBuilder
  ) {}

  // Initialisation du composant
  ngOnInit(): void {
    // Initialisation du formulaire
    this.initForm();

    // Récupération des données existantes via l'API
    this.fetchAllEntrees();
  }

  // Initialiser le formulaire avec des validations
  private initForm() {
    this.entreForm = this.fb.group({
      utilisateurId: ['', Validators.required],
      partenaireId: ['', Validators.required],
      deviseId: ['', Validators.required],
      expediteur: ['', Validators.required],
      receveur: ['', Validators.required],
      montant_gnf: [0, Validators.required],
      telephone_receveur: ['', Validators.required],
      payement_type: ['', Validators.required],
      status: ['', Validators.required],
    });
  }

  // Méthode pour récupérer toutes les entrées via l'API
  private fetchAllEntrees(): void {
    this.entreService.getAllEntree().subscribe({
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
    if (this.entreForm.valid) {
      const formData = this.entreForm.value; // Récupérer les valeurs du formulaire
      this.entreService.ajouterEntree(formData).subscribe({
        next: (response) => {
          console.log('Entrée ajoutée avec succès:', response);
          alert('Entrée ajoutée avec succès !');

          // Réinitialiser le formulaire et mettre à jour la liste
          this.entreForm.reset();
          this.fetchAllEntrees();
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
