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
import { EntreServiceService } from '../../services/entre/entre-service.service';
import { HttpClient} from '@angular/common/http';
import { response } from 'express';



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
  allEntre: any[] = [];

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
    private calculService: CalculBeneficeService,
    private entreService: EntreServiceService,
    private http: HttpClient
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
    this.getAllEntre();
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

  dateDebutPayer: string = '';  // Stocke la date de début
  dateFinPayer: string = '';    // Stocke la date de fin
  searchNom: string = '';  // Stocke la recherche par nom
  
  private getAllEntre(): void {
    this.entreService.getAllEntree().subscribe({
      next: (response) => {
        // Appliquer le filtre de base (exclure "ANNULEE" et "R")
        this.allEntre = response.filter((entre: any) => entre.status !== "ANNULEE" && entre.type !== "R");
  
        // Appliquer les filtres supplémentaires
        this.filtrerEntre();
      },
      error: (error) => {
        console.error("Erreur lors de la récupération des entrées :", error);
      }
    });
  }

  filteredEntre: any[] = []; // Liste filtrée affichée dans le tableau

  
  // Fonction pour filtrer selon la date et le nom
  filtrerEntre() {
    this.filteredEntre = this.allEntre.filter((entre: any) => {
      const dateCreation = new Date(entre.date_creation); // Convertir la date en format Date JS
      const debut = this.dateDebut ? new Date(this.dateDebut) : null;
      const fin = this.dateFin ? new Date(this.dateFin) : null;
  
      // Vérifier si l'entrée est dans l'intervalle de dates
      const estDansIntervalle = (!debut || dateCreation >= debut) && (!fin || dateCreation <= fin);
  
      // Vérifier si le nom du partenaire correspond à la recherche
      const nomComplet = `${entre.Partenaire.prenom} ${entre.Partenaire.nom}`.toLowerCase();
      const correspondNom = !this.searchNom || nomComplet.includes(this.searchNom.toLowerCase());
  
      return estDansIntervalle && correspondNom;
    });
  }
  
  


 payerSelection() {
    const selectedEntries = this.allEntre
      .filter(entry => entry.selected)
      .map(entry => entry.id);
  
    if (selectedEntries.length === 0) {
      alert("Veuillez sélectionner au moins une ligne.");
      return;
    }
  
    this.http.post('http://localhost:3000/api/entrees/payer', { ids: selectedEntries }).subscribe({
      next: (response: any) => {
        alert(response.message); // Affiche le message du backend en cas de succès
        this.getAllEntre();
      },
      error: (error) => {
        // Vérifier si le serveur renvoie un message d'erreur et l'afficher
        const errorMessage = error.error && error.error.message 
          ? error.error.message 
          : "Une erreur est survenue.";
        
        alert(errorMessage);
      }
    });
  }
  
  
  toggleAllSelection(event: any) {
    const checked = event.target.checked;
    this.allEntre.forEach(entry => entry.selected = checked);
  }

 }
