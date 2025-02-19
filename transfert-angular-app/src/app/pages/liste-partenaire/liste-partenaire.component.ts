import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';

@Component({
  selector: 'app-liste-partenaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTablesModule],  // Enlever BrowserModule
  templateUrl: './liste-partenaire.component.html',
  styleUrls: ['./liste-partenaire.component.css']  // Correction de 'styleUrl' en 'styleUrls'
})
export class ListePartenaireComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: any[] = [];

  userInfo: any = null;
  idUser: string = '';

  partenaireForm!: FormGroup;

  dtoptions: any = {};

  dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private partenaireService: PartenaireServiceService
  ) { }

  ngOnInit(): void {
    this.dtoptions = {
      paging: true, // Activer la pagination
      pagingType: 'full_numbers', // Type de pagination
      pageLength: 10 // Nombre d'éléments par page
    };
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
        // if (this.allresultat && this.allresultat.length > 0) {
        //   this.dtTrigger.next(null); // Initialisation de DataTables
        // }
        console.log(this.allresultat);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données', error);
      },
    });
  }
  isLoading: boolean = false;

  onSubmit() {
    if (this.partenaireForm.valid) {
      const formData = this.partenaireForm.value;
      this.isLoading = true;
      this.partenaireService.ajouterPartenaire(formData).subscribe(
        response => {
          this.isLoading = false;
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
