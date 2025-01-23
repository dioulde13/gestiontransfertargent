import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { CreditService } from '../../services/credits/credit.service';

@Component({
  selector: 'app-liste-credit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // Enlever BrowserModule
  templateUrl: './liste-credit.component.html',
  styleUrl: './liste-credit.component.css'
})
export class ListeCreditComponent implements OnInit {

  // Tableau pour stocker les résultats
  allresultat: any[] = [];

  creditForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private creditService: CreditService
  ) { }

  ngOnInit(): void {
    // Initialisation du formulaire avec les validations
    this.creditForm = this.fb.group({
      utilisateurId: ['', Validators.required],
      nom: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
    });
    this.getAllCredit();
  }

  getAllCredit() {
    // Appel à l'API et gestion des réponses
    this.creditService.getAllCredit().subscribe({
      next: (response) => {
        this.allresultat = response;
        console.log(this.allresultat);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données', error);
      },
    });
  }

  onSubmit() {
    if (this.creditForm.valid) {
      const formData = this.creditForm.value;

      // Appeler le service pour ajouter le partenaire
      this.creditService.ajoutCredit(formData).subscribe(
        response => {
          console.log('Partenaire ajouté avec succès:', response);
          alert('Partenaire ajouté avec succès!');
          this.creditForm.reset(); // Réinitialiser le formulaire après ajout
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
