import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { DepenseService } from '../../services/depenses/depense.service';

@Component({
  selector: 'app-liste-depense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // Enlever BrowserModule
  templateUrl: './liste-depense.component.html',
  styleUrl: './liste-depense.component.css'
})
export class ListeDepenseComponent  implements OnInit{

  // Tableau pour stocker les résultats
    allresultat: any[] = [];
  
    depenseForm!: FormGroup;
  
    constructor(
      private fb: FormBuilder,
      private depenseService: DepenseService
    ) { }
  
    ngOnInit(): void {
      // Initialisation du formulaire avec les validations
      this.depenseForm = this.fb.group({
        utilisateurId: ['', Validators.required],
        motif: ['', Validators.required],
        montant: [0, [Validators.required, Validators.min(0)]],
      });
      this.getAllDepense();
    }
  
    getAllDepense() {
      // Appel à l'API et gestion des réponses
      this.depenseService.getAllDepense().subscribe({
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
      if (this.depenseForm.valid) {
        const formData = this.depenseForm.value;
  
        // Appeler le service pour ajouter le partenaire
        this.depenseService.ajoutDepense(formData).subscribe(
          response => {
            console.log('Partenaire ajouté avec succès:', response);
            alert('Partenaire ajouté avec succès!');
            this.depenseForm.reset(); // Réinitialiser le formulaire après ajout
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
