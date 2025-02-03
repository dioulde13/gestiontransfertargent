import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { PayementService } from '../../services/payements/payement.service';
import { AuthService } from '../../services/auth/auth-service.service';

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

  userInfo: any = null;
  idUser: string = '';

  payementForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private payementService: PayementService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Initialisation du formulaire avec les validations
    this.payementForm = this.fb.group({
      utilisateurId: [this.idUser],
      code: ['', Validators.required],
      montant: ['', Validators.required],
    });

   this.getAllPayement();
    this.getUserInfo(); // Récupération des infos utilisateur
  }

  getAllPayement(){
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

  getUserInfo() {
    this.authService.getUserInfo().subscribe(
      {
        next: (response) => {
          this.userInfo = response.user;
          //   if (this.userInfo) {
          this.idUser = this.userInfo.id;
          console.log('Informations utilisateur:', this.userInfo);

          // Mettre à jour le champ utilisateurId dans le formulaire
          this.payementForm.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
  }

  loading: boolean = false;

  onSubmit() {
    if (this.payementForm.valid) {
      const formData = this.payementForm.value;
     this.loading = true;
      // Appeler le service pour ajouter le partenaire
      this.payementService.ajouterPayement(formData).subscribe(
        response => {
          this.loading = false;
          console.log('Payement ajouté avec succès:', response);
          this.payementForm.patchValue({
            code: '',
            montant: ''
          });
          this.getAllPayement();
          alert('Payement ajouté avec succès!');
        },
        error => {
          this.loading = false;
          const errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'ajout du résultat.';
          alert(errorMessage);
          // console.error('Erreur lors de l\'ajout du payement:', error);
          // alert('Erreur lors de l\'ajout du payement.');
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
