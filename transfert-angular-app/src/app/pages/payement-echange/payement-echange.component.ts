import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { PayementService } from '../../services/payementEchange/payement.service';

@Component({
  selector: 'app-payement-echange',
  standalone: true,
   imports: [CommonModule, ReactiveFormsModule, DataTablesModule],  // Enlever BrowserModule
  templateUrl: './payement-echange.component.html',
  styleUrl: './payement-echange.component.css'
})
export class PayementEchangeComponent implements OnInit{

   // Tableau pour stocker les résultats
    allresultat: any[] = [];
  
    userInfo: any = null;
    idUser: string = '';
  
    payementForm!: FormGroup;
  
    dtoptions: any = {};
  
    dtTrigger: Subject<any> = new Subject<any>();
  
    constructor(
      private fb: FormBuilder,
      private payementService: PayementService,
      private authService: AuthService,
    ) {}
  
    ngOnInit(): void {
      this.dtoptions = {
        paging: true, // Activer la pagination
        pagingType: 'full_numbers', // Type de pagination
        pageLength: 10 // Nombre d'éléments par page
      };
      // Initialisation du formulaire avec les validations
      this.payementForm = this.fb.group({
        utilisateurId: [this.idUser],
        code: ['', Validators.required],
        montant: ['', Validators.required],
      });
  
     this.getAllPayementEchange();
      this.getUserInfo(); // Récupération des infos utilisateur
    }
  
    getAllPayementEchange(){
       // Appel à l'API et gestion des réponses
       this.payementService.getAllPayementEchange().subscribe({
        next: (response) => {
          this.allresultat = response;
          if (this.allresultat && this.allresultat.length > 0) {
            this.dtTrigger.next(null); // Initialisation de DataTables
          }
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
        this.payementService.ajouterPayemnentEchange(formData).subscribe(
          response => {
            this.loading = false;
            console.log('Payement ajouté avec succès:', response);
            this.payementForm.patchValue({
              code: '',
              montant: ''
            });
            this.getAllPayementEchange();
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
