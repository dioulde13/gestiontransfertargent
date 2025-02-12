import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';  // Remplacer BrowserModule par CommonModule
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { RembourserService } from '../../services/rembourser/rembourser.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';
import { DeviseService } from '../../services/devise/devise.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { CalculBeneficeService } from '../../services/calculBenefices/calcul-benefice.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-liste-rembourser',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTablesModule, FormsModule],
  templateUrl: './liste-rembourser.component.html',
  styleUrl: './liste-rembourser.component.css'
})
export class ListeRembourserComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: any[] = [];

  userInfo: any = null;
  idUser: string = '';

  rembourserForm!: FormGroup;

  dtoptions: any = {};

  dtTrigger: Subject<any> = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private deviseService: DeviseService,
    private partenaireService: PartenaireServiceService,
    private rembourserService: RembourserService,
    private calculService: CalculBeneficeService
  ) { }

  ngOnInit(): void {

    this.dtoptions = {
      paging: true, // Activer la pagination
      pagingType: 'full_numbers', // Type de pagination
      pageLength: 10 // Nombre d'éléments par page
    };
    this.getAllRemboursement();
    // Initialisation du formulaire avec les validations
    this.rembourserForm = this.fb.group({
      utilisateurId: [this.idUser],
      deviseId: ['', Validators.required],
      partenaireId: ['', Validators.required],
      nom: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
    });
    this.fetchPartenaire();
    this.fetchDevise();
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
          this.rembourserForm.patchValue({ utilisateurId: this.idUser });
        }
      }
    );
  }

  onSubmit() {
    if (this.rembourserForm.valid) {
      const formData = this.rembourserForm.value;
      // Appeler le service pour ajouter le partenaire
      this.rembourserService.ajouterRembourser(formData).subscribe(
        response => {
          console.log('Partenaire ajouté avec succès:', response);
          this.getAllRemboursement();
          this.rembourserForm.patchValue({
            deviseId: '',
            partenaireId: '',
            nom: '',
            montant: ''
          });
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


  allDevise: any[] = [];

  // Récupération des devises
  fetchDevise(): void {
    this.deviseService.getAllDevise().subscribe(
      (response) => {
        this.allDevise = response;
        console.log('Liste des devises:', this.allDevise);
      },
      (error) => {
        console.error('Erreur lors de la récupération des devises:', error);
      }
    );
  }

  allPartenaire: any[] = [];

  // Récupération des devises
  fetchPartenaire(): void {
    this.partenaireService.getAllPartenaire().subscribe(
      (response) => {
        this.allPartenaire = response;
        if (this.allPartenaire && this.allPartenaire.length > 0) {
          this.dtTrigger.next(null); // Initialisation de DataTables
        }
        console.log('Liste des partenaires:', this.allPartenaire);
      },
      (error) => {
        console.error('Erreur lors de la récupération des partenaires:', error);
      }
    );
  }



 
  private getAllRemboursement(): void {
    // Appel à l'API et gestion des réponses
    this.rembourserService.getAllRebourser().subscribe({
      next: (response) => {
        this.allresultat = response;
        console.log(this.allresultat);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données', error);
      },
    });
  }

  dateDebut: string = '';
  dateFin: string = '';
  montant: number = 0;
  prix: number = 0;
  prix_1: number = 0;  // Champ à saisir par l'utilisateur
  resultats: any;

  onCalculer() {
    this.calculService.calculerBenefice(this.dateDebut, this.dateFin, this.montant, this.prix_1, this.prix).subscribe(
      (response) => {
        this.resultats = response;
        console.log(this.resultats);
      },
      (error) => {
        console.error('Erreur:', error);
      }
    );
  }

 }
