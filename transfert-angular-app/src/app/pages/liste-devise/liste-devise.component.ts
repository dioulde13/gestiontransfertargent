import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { DeviseService } from '../../services/devise/devise.service';


@Component({
  selector: 'app-liste-devise',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // Enlever BrowserModule
  templateUrl: './liste-devise.component.html',
  styleUrl: './liste-devise.component.css'
})
export class ListeDeviseComponent implements OnInit{
// Tableau pour stocker les résultats
  allresultat: any[] = [];
  deviseForm!: FormGroup;

  // Injection du service ApiService
  constructor(private devise: DeviseService,private fb: FormBuilder
  ) {}

  // Méthode d'initialisation
  ngOnInit(): void {

    this.deviseForm = this.fb.group({
      utilisateurId: ['', Validators.required],
      paysDepart: ['', Validators.required],
      paysArriver: ['', Validators.required],
      signe_1: ['', Validators.required],
      signe_2: ['', Validators.required],
      prix_1: ['', Validators.required],
      prix_2: ['', Validators.required],
    });

    // Appel à l'API et gestion des réponses
    this.devise.getAllDevise().subscribe({
      next: (response) => {
        // Vérification du succès de la réponse
          this.allresultat = response; // Assurez-vous que 'data' existe dans la réponse
          console.log(this.allresultat);
      },
      error: (error) => {
        // Gestion des erreurs lors de l'appel à l'API
        console.error('Erreur lors de la récupération des données', error);
      },
    });
  }

  onSubmit() {
    if (this.deviseForm.valid) {
      const formData = this.deviseForm.value;

      // Appeler le service pour ajouter le partenaire
      this.devise.ajouterDevise(formData).subscribe(
        response => {
          console.log('Partenaire ajouté avec succès:', response);
          alert('Partenaire ajouté avec succès!');
          this.deviseForm.reset(); // Réinitialiser le formulaire après ajout
        },
        error => {
          console.error('Erreur lors de l\'ajout du partenaire:', error);
          alert('Erreur lors de l\'ajout du partenaire.');
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

}
