import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { PayementService } from '../../services/payements/payement.service';

@Component({
  selector: 'app-payements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // Enlever BrowserModule
  templateUrl: './payements.component.html',
  styleUrl: './payements.component.css'
})
export class PayementsComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: any[] = [];

  payementForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private payementService: PayementService
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire avec les validations
    this.payementForm = this.fb.group({
      utilisateurId: ['', Validators.required],
      entreId: ['', Validators.required],
      montant: ['', Validators.required],
    });

    // Appel à l'API et gestion des réponses
    this.payementService.getAllPayement().subscribe({
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
    if (this.payementForm.valid) {
      const formData = this.payementForm.value;

      // Appeler le service pour ajouter le partenaire
      this.payementService.ajouterPayement(formData).subscribe(
        response => {
          console.log('Payement ajouté avec succès:', response);
          alert('Payement ajouté avec succès!');
          this.payementForm.reset(); // Réinitialiser le formulaire après ajout
        },
        error => {
          console.error('Erreur lors de l\'ajout du payement:', error);
          alert('Erreur lors de l\'ajout du payement.');
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
