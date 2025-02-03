import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { DeviseService } from '../../services/devise/devise.service';
import { AuthService } from '../../services/auth/auth-service.service';


@Component({
  selector: 'app-liste-devise',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],  // Enlever BrowserModule
  templateUrl: './liste-devise.component.html',
  styleUrl: './liste-devise.component.css'
})
export class ListeDeviseComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: any[] = [];
  deviseForm!: FormGroup;

  userInfo: any = null;
  idUser: string = '';

  // Injection du service ApiService
  constructor(private devise: DeviseService, private fb: FormBuilder, private authService: AuthService) { }

  // Méthode d'initialisation
  ngOnInit(): void {

    this.deviseForm = this.fb.group({
      utilisateurId: ['', Validators.required],
      paysDepart: ['', Validators.required],
      paysArriver: ['', Validators.required],
      signe_1: ['', Validators.required],
      signe_2: ['', Validators.required],
      prix_1: ['', Validators.required],
      prix_2: ['', Validators.required],
    });
    this.getAllDevise();

    this.getUserInfo(); // Récupération des infos utilisateur
  }

  getAllDevise(){
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

  getUserInfo() {
    this.authService.getUserInfo().subscribe(
      {
        next: (response) => {
          this.userInfo = response.user;
          //   if (this.userInfo) {
          this.idUser = this.userInfo.id;
          console.log('Informations utilisateur:', this.userInfo);

          // Mettre à jour le champ utilisateurId dans le formulaire
          this.deviseForm.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
  }

  isLoading: boolean = false;

  onSubmit() {
    if (this.deviseForm.valid) {
      const formData = this.deviseForm.value;
      this.isLoading = true;
      // Appeler le service pour ajouter le partenaire
      this.devise.ajouterDevise(formData).subscribe(
        response => {
          console.log('Partenaire ajouté avec succès:', response);
          this.isLoading = false;
          this.getAllDevise();
          this.deviseForm.patchValue({
            paysDepart: '',
            paysArriver: '',
            signe_1: '',
            signe_2: '',
            prix_1: '',
            prix_2: ''
          });
          alert('Devise ajouté avec succès!');
        },
        error => {
          console.error('Erreur lors de l\'ajout du devise:', error);
          alert('Erreur lors de l\'ajout du devise.');
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

}
