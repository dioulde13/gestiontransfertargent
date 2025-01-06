import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';

@Component({
  selector: 'app-liste-partenaire',
  imports: [CommonModule],
  templateUrl: './liste-partenaire.component.html',
  styleUrl: './liste-partenaire.component.css'
})
export class ListePartenaireComponent implements OnInit{
// Tableau pour stocker les résultats
  allresultat: any[] = [];

  // Injection du service ApiService
  constructor(private partenaire: PartenaireServiceService) {}

  // Méthode d'initialisation
  ngOnInit(): void {
    // Appel à l'API et gestion des réponses
    this.partenaire.getAllPartenaire().subscribe({
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
