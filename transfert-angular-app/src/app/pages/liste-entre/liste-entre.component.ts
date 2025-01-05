import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';

@Component({
  selector: 'app-liste-entre',
  imports: [CommonModule],
  templateUrl: './liste-entre.component.html',
  styleUrl: './liste-entre.component.css'
})
export class ListeEntreComponent implements OnInit{
// Tableau pour stocker les résultats
  allresultat: any[] = [];

  // Injection du service ApiService
  constructor(private apiService: ApiService) {}

  // Méthode d'initialisation
  ngOnInit(): void {
    // Appel à l'API et gestion des réponses
    this.apiService.getAllEntree().subscribe({
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
