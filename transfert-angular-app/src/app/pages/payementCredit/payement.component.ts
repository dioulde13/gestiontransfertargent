import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { AuthService } from '../../services/auth/auth-service.service';
import { PayementCreditService } from '../../services/payementCredit/payement-credit.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';


@Component({
  selector: 'app-payement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTablesModule],  // Enlever BrowserModule
  templateUrl: './payement.component.html',
  styleUrl: './payement.component.css'
})
export class PayementComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: any[] = [];

  userInfo: any = null;
  idUser: string = '';

  payementCreditForm!: FormGroup;

   dtoptions: any = {};
      
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private payementCreditService: PayementCreditService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.dtoptions = {
      paging: true, // Activer la pagination
      pagingType: 'full_numbers', // Type de pagination
      pageLength: 10 // Nombre d'éléments par page
    };
    // Initialisation du formulaire avec les validations
    this.payementCreditForm = this.fb.group({
      utilisateurId: [this.idUser],
      reference: ['', Validators.required],
      montant: ['', Validators.required],
    });
    this.getAllPayementCredit();
    this.getUserInfo(); // Récupération des infos utilisateur
  }

  getAllPayementCredit(){
    this.payementCreditService.getAllPayementCredit().subscribe({
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
          this.payementCreditForm.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
  }

  loading: boolean = false;


  onSubmit() {
    if (this.payementCreditForm.valid) {
      const formData = this.payementCreditForm.value;
      this.loading = true;
      // Appeler le service pour ajouter le partenaire
      this.payementCreditService.ajouterPayementCredit(formData).subscribe(
        response => {
          console.log('Payement ajouté avec succès:', response);
          alert('Payement ajouté avec succès!');
          this.payementCreditForm.patchValue({
            reference: '',
            montant: ''
          });  
          this.getAllPayementCredit();
          this.loading = false;
         },
        (error) => {
          // Vérifie si l'erreur contient un message spécifique
          const errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'ajout du résultat.';
          alert(errorMessage);
        }
        // error => {
        //   console.error('Erreur lors de l\'ajout du payement:', error);
        //   alert('Erreur lors de l\'ajout du payement.');
        // }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

}
