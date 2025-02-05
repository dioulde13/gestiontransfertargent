import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { DepenseService } from '../../services/depenses/depense.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';


@Component({
  selector: 'app-liste-depense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTablesModule],  // Enlever BrowserModule
  templateUrl: './liste-depense.component.html',
  styleUrl: './liste-depense.component.css'
})
export class ListeDepenseComponent implements OnInit {

  // Tableau pour stocker les résultats
  allresultat: any[] = [];

  userInfo: any = null;
  idUser: string = '';

  depenseForm!: FormGroup;
  
    dtoptions: any = {};
  
    dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private depenseService: DepenseService,
    private authService: AuthService

  ) { }

  ngOnInit(): void {
    this.dtoptions = {
      paging: true, // Activer la pagination
      pagingType: 'full_numbers', // Type de pagination
      pageLength: 10 // Nombre d'éléments par page
    };
    // Initialisation du formulaire avec les validations
    this.depenseForm = this.fb.group({
      utilisateurId: [this.idUser],
      motif: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
    });
    this.getAllDepense();
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
          this.depenseForm.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
  }

  getAllDepense() {
    // Appel à l'API et gestion des réponses
    this.depenseService.getAllDepense().subscribe({
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

  loading: boolean = false;


  onSubmit() {
    if (this.depenseForm.valid) {
      this.loading = true;
      const formData = this.depenseForm.value;
      // Appeler le service pour ajouter le partenaire
      this.depenseService.ajoutDepense(formData).subscribe(
        response => {
          this.getAllDepense();
          console.log('Deppense ajouté avec succès:', response);
          alert('Deppense ajouté avec succès!');
          this.depenseForm.patchValue({
            motif: '',
            montant: ''
          }); 
          this.loading = false;
        },
        error => {
          console.error('Erreur lors de l\'ajout du depense:', error);
          alert('Erreur lors de l\'ajout du depense.');
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

}
