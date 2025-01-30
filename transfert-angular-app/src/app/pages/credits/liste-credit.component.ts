import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { CreditService } from '../../services/credits/credit.service';
import { AuthService } from '../../services/auth/auth-service.service';

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

  userInfo: any = null;
  idUser: string = '';

  creditForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private creditService: CreditService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Initialisation du formulaire avec les validations
    // Initialisation du formulaire
    this.creditForm = this.fb.group({
      // Champ pour l'identifiant de l'utilisateur (pré-rempli avec l'ID de l'utilisateur courant)
      utilisateurId: [this.idUser],

      // Champ pour le nom, obligatoire
      nom: ['', Validators.required],

      // Champ pour le montant, obligatoire et doit être un nombre positif ou zéro
      montant: [0, [Validators.required, Validators.min(0)]]
      
    });

    this.getAllCredit();
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
          this.creditForm.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
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
      console.log(formData);
      // Appeler le service pour ajouter le partenaire
      this.creditService.ajoutCredit(formData).subscribe(
        response => {
          this.getAllCredit();
          console.log('Credit ajouté avec succès:', response);
          this.creditForm.patchValue({
            nom: '',
            montant: ''
          });
          alert('Credit ajouté avec succès!');
        },
        error => {
          console.error('Erreur lors de l\'ajout du credit:', error);
          alert('Erreur lors de l\'ajout du credit.');
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

}
