import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { AuthService } from '../../services/auth/auth-service.service';

@Component({
  selector: 'app-liste-partenaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // Enlever BrowserModule
  templateUrl: './liste-partenaire.component.html',
  styleUrls: ['./liste-partenaire.component.css']  // Correction de 'styleUrl' en 'styleUrls'
})
export class ListePartenaireComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: any[] = [];

  userInfo: any = null;
  idUser: string = '';

  partenaireForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private partenaireService: PartenaireServiceService
  ) { }

  ngOnInit(): void {
    // Initialisation du formulaire avec les validations
    this.partenaireForm = this.fb.group({
      utilisateurId: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      pays: ['', Validators.required],
      montant_preter: [0, [Validators.required, Validators.min(0)]],
    });
    this.getAllPartenaire();
    this.getUserInfo(); // Récupération des infos utilisateur
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
          this.partenaireForm.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
  }
  getAllPartenaire() {
    // Appel à l'API et gestion des réponses
    this.partenaireService.getAllPartenaire().subscribe({
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
    if (this.partenaireForm.valid) {
      const formData = this.partenaireForm.value;
      // Appeler le service pour ajouter le partenaire
      this.partenaireService.ajouterPartenaire(formData).subscribe(
        response => {
          console.log('Partenaire ajouté avec succès:', response);
          this.partenaireForm.patchValue({
            nom: '',
            prenom: '',
            pays: '',
            montant_preter: ''
          });
          this.getAllPartenaire();
          alert('Partenaire ajouté avec succès!');
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
