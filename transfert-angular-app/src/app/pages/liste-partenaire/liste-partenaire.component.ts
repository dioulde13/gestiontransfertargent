import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Remplacer BrowserModule par CommonModule
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms'; // Import du module des formulaires réactifs
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { DeviseService } from '../../services/devise/devise.service';
import { error } from 'node:console';

@Component({
  selector: 'app-liste-partenaire',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTablesModule], // Enlever BrowserModule
  templateUrl: './liste-partenaire.component.html',
  styleUrls: ['./liste-partenaire.component.css'], // Correction de 'styleUrl' en 'styleUrls'
})
export class ListePartenaireComponent implements OnInit {
  // Tableau pour stocker les résultats
  allresultat: any[] = [];

  userInfo: any = null;
  idUser: string = '';

  partenaireForm!: FormGroup;

  dtoptions: any = {};

  dtTrigger: Subject<any> = new Subject<any>();

  selectPaye: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private partenaireService: PartenaireServiceService,
    private deviseService: DeviseService
  ) {}

  ngOnInit(): void {
    this.dtoptions = {
      paging: true, // Activer la pagination
      pagingType: 'full_numbers', // Type de pagination
      pageLength: 10, // Nombre d'éléments par page
    };
    this.initPartenaire();
    this.partenaireFormIntial();
    this.getAllPartenaire();
    this.getUserInfo(); // Récupération des infos utilisateur
    this.fetchDevise();
  }

  private partenaireFormIntial(): void {
    // Initialisation du formulaire avec les validations
    this.partenaireForm = this.fb.group({
      utilisateurId: [this.idUser], // Liaison utilisateurId
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      pays: ['', Validators.required],
      montant_preter: [0, [Validators.required, Validators.min(0)]],
    });
  }

  allDevise: any[] = [];
  uniqueDevise: any[] = [];

  fetchDevise(): void {
    this.deviseService.getAllDevise().subscribe(
      (response) => {
        this.allDevise = response;

        // Utilisation d'un Set pour garder les devises uniques par `signe_2`
        const seen = new Set();
        this.uniqueDevise = this.allDevise.filter((devise) => {
          if (!seen.has(devise.signe_2)) {
            seen.add(devise.signe_2);
            return true; // Garder cette devise
          }
          return false; // Ignorer les doublons
        });

        console.log('Liste des devises uniques:', this.uniqueDevise);
      },
      (error) => {
        console.error('Erreur lors de la récupération des devises:', error);
      }
    );
  }

  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        this.userInfo = response.user;
        //   if (this.userInfo) {
        this.idUser = this.userInfo.id;
        console.log('Informations utilisateur:', this.userInfo);

        // Mettre à jour le champ utilisateurId dans le formulaire
        this.partenaireForm.patchValue({ utilisateurId: this.idUser });

        this.initPartenaire();
      },
    });
  }

  editPartenaireForm!: FormGroup;

  private initPartenaire(): void {
    this.editPartenaireForm = this.fb.group({
      deviseId: ['', Validators.required],
      utilisateurId: [this.idUser],
    });
  }

  selectedPartenaire: any = null;

  onPartenaireEdit(partenaire: any) {
    this.selectedPartenaire = partenaire;
  }

  loadingRembourser: boolean = false;
  onPartenaireUpdate() {
    this.loadingRembourser = true;
    const updatedData = this.editPartenaireForm.value;
    // console.log(updatedData);
    // console.log(this.selectedPartenaire.id);
    this.partenaireService
      .rembourserDevise(this.selectedPartenaire.id, updatedData)
      .subscribe({
        next: (response) => {
          this.loadingRembourser = false;
          alert(response.message);
        },
        error: (error) => {
          alert(error.error.message);
        },
      });
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
        (response) => {
          this.isLoading = false;
          console.log('Partenaire ajouté avec succès:', response);
          this.partenaireForm.patchValue({
            nom: '',
            prenom: '',
            pays: '',
            montant_preter: '',
          });
          this.getAllPartenaire();
          alert('Partenaire ajouté avec succès!');
        },
        (error) => {
          console.error("Erreur lors de l'ajout du partenaire:", error);
          alert("Erreur lors de l'ajout du partenaire.");
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
}
