import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { RembourserService } from '../../services/rembourser/rembourser.service';

@Component({
  selector: 'app-liste-rembourser',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './liste-rembourser.component.html',
  styleUrl: './liste-rembourser.component.css'
})
export class ListeRembourserComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: any[] = [];

  rembourserForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private rembourserService: RembourserService
  ) { }

  ngOnInit(): void {
    this.getAllRemboursement();
    // Initialisation du formulaire avec les validations
    this.rembourserForm = this.fb.group({
      utilisateurId: ['', Validators.required],
      partenaireId: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
    });


  }
  private getAllRemboursement(): void {
    // Appel à l'API et gestion des réponses
    this.rembourserService.getAllRebourser().subscribe({
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
    if (this.rembourserForm.valid) {
      const formData = this.rembourserForm.value;

      // Appeler le service pour ajouter le partenaire
      this.rembourserService.ajouterRembourser(formData).subscribe(
        response => {
          console.log('Partenaire ajouté avec succès:', response);
          alert('Partenaire ajouté avec succès!');
          this.rembourserForm.reset(); // Réinitialiser le formulaire après ajout
          this.getAllRemboursement();
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
