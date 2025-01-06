import { Component, OnInit } from '@angular/core';
import { DeviseService } from '../../services/devise/devise.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-liste-devise',
  imports: [CommonModule],
  templateUrl: './liste-devise.component.html',
  styleUrl: './liste-devise.component.css'
})
export class ListeDeviseComponent implements OnInit{
// Tableau pour stocker les résultats
  allresultat: any[] = [];

  // Injection du service ApiService
  constructor(private devise: DeviseService) {}

  // Méthode d'initialisation
  ngOnInit(): void {
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

}
