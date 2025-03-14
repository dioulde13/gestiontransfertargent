import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntreServiceService } from '../../services/entre/entre-service.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth/auth-service.service';
import { DeviseService } from '../../services/devise/devise.service';
import { PartenaireServiceService } from '../../services/partenaire/partenaire-service.service';

import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';
import { NgxPrintModule } from 'ngx-print';

interface Result {
  code: string;
  date_creation: string;
  pays_dest: string;
  expediteur: string;
  receveur: string;
  telephone_receveur: string;
  nomCLient: string;
  montant_cfa: number;
  signe_2: string;
  prix_2: number;
  montant_rembourser: number;
  montant_gnf: number;
  montant_payer: number;
  montant_restant: number;
  montantClient: number;
  status: string;
  type_annuler?: string;
  id: number;
}

@Component({
  selector: 'app-liste-entre',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DataTablesModule,
    NgxPrintModule,
  ],
  templateUrl: './liste-entre.component.html',
  styleUrls: ['./liste-entre.component.css'],
})
export class ListeEntreComponent implements OnInit, AfterViewInit, OnDestroy {
  // dtoptions: any = {};

  dtTrigger: Subject<any> = new Subject<any>();

  allresultat: Result[] = [];
  private dataTable: any;

  editDeviseForm!: FormGroup;

  startDate: Date | null = null;
  endDate: Date | null = null;

  totalMontant: number = 0; // Initialisation
  totalMontantDevise: number = 0; // Initialisation

  filtrerEntreDates(): void {
    const startDateInput = (
      document.getElementById('startDate') as HTMLInputElement
    ).value;
    const endDateInput = (
      document.getElementById('endDate') as HTMLInputElement
    ).value;

    this.startDate = startDateInput ? new Date(startDateInput) : null;
    this.endDate = endDateInput ? new Date(endDateInput) : null;

    // Réinitialiser le total
    this.totalMontant = 0;
    this.totalMontantDevise = 0;

    // Filtrer d'abord par date
    let filteredResults = this.allresultat.filter(
      (result: { date_creation: string }) => {
        const resultDate = new Date(result.date_creation);
        return (
          (!this.startDate || resultDate >= this.startDate) &&
          (!this.endDate || resultDate <= this.endDate)
        );
      }
    );

    // Mettre à jour DataTable avec les résultats filtrés par date
    this.dataTable.clear().rows.add(filteredResults).draw();

    // Attendre que DataTable applique son propre filtre (search)
    setTimeout(() => {
      const filteredDataTable: { montant_gnf: number }[] = this.dataTable
        .rows({ search: 'applied' })
        .data()
        .toArray();

      // Recalculer le total avec des types explicitement définis
      this.totalMontant = filteredDataTable.reduce(
        (sum: number, row: { montant_gnf: number }) => {
          return sum + row.montant_gnf;
        },
        0
      );

      console.log(
        'Total Montant après filtre et recherche :',
        this.totalMontant
      );
    }, 200); // Timeout pour attendre la mise à jour de DataTable
  }

  private fetchAllEntre(): void {
    this.entreService.getAllEntree().subscribe({
      next: (response) => {
        this.allresultat = response;
        console.log('Liste des entrées:', this.allresultat);
        this.initDataTable();
        this.cd.detectChanges(); // Forcer la détection des changements
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données:', error);
      },
    });
  }

  private initDataTable(): void {
    setTimeout(() => {
      if (this.dataTable) {
        this.dataTable.destroy();
      }
      this.dataTable = ($('#datatable') as any).DataTable({
        dom:
          "<'row'<'col-sm-6 dt-buttons-left'B><'col-sm-6 text-end dt-search-right'f>>" +
          "<'row'<'col-sm-12'tr>>" +
          "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        buttons: ['csv', 'excel', 'pdf', 'print'],
        paging: true,
        searching: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50],
        data: this.allresultat,
        order: [0, 'desc'],
        columns: [
          { title: 'Code', data: 'code' },
          {
            title: 'Date du jour',
            data: 'date_creation',
            render: (data: string) => {
              const date = new Date(data);
              return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            },
          },
          { title: 'Client', data: 'nomCLient' },
          { title: 'Pays', data: 'pays_dest' },
          { title: 'Expéditeur', data: 'expediteur' },
          { title: 'Receveur', data: 'receveur' },
          { title: 'Téléphone', data: 'telephone_receveur' },
          {
            title: 'Montant',
            data: 'montant_cfa',
            render: (data: number, type: string, row: any) => {
              if (data === 0) return '';
              return `${new Intl.NumberFormat('fr-FR').format(data)} ${
                row.signe_2
              }`;
            },
          },
          {
            title: 'Prix',
            data: 'prix_2',
            render: (data: number, type: string, row: any) => {
              return data === 0
                ? ''
                : `${new Intl.NumberFormat('fr-FR').format(data)} ${
                    row.montant_cfa === 0 ? '' : 'GNF'
                  }`;
            },
          },
          {
            title: 'Montant en GNF',
            data: 'montant_gnf',
            render: (data: number, type: string, row: any) => {
              const montantRembourser = row.montant_rembourser;

              const montantGNF = row.montant_gnf;

              return row.montant_cfa === 0
                ? `${new Intl.NumberFormat('fr-FR').format(row.montantClient)} 
                (${new Intl.NumberFormat('fr-FR').format(montantRembourser)})
                GNF`
                : `${new Intl.NumberFormat('fr-FR').format(montantGNF)} 
               GNF`;
            },
          },
          {
            title: 'Montant payé (GNF)',
            data: 'montant_payer',
            render: (data: number, type: string, row: any) => {
              if (data === 0) return '';
              const montantRembourser = row.montant_rembourser;
              // console.log(montantRembourser);
              return `${new Intl.NumberFormat('fr-FR').format(data)} 
              (${new Intl.NumberFormat('fr-FR').format(
                montantRembourser
              )}) GNF`;
            },
          },
          {
            title: 'Montant restant (GNF)',
            data: 'montant_restant',
            render: (data: number, type: string, row: any) => {
              return data === 0
                ? ''
                : `${new Intl.NumberFormat('fr-FR').format(data)} GNF`;
            },
          },
          {
            title: 'Statut de paiement',
            data: 'status',
            render: (data: string, type: string, row: any) => {
              if (row.montant_cfa === 0)
                return `${row.status} (${row.type_annuler})`;
              return data + (data === `ANNULEE` ? `(${row.type_annuler})` : ``);
            },
          },
        ],
      });
      this.cd.detectChanges();
    }, 100);
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    this.dtTrigger.unsubscribe();
  }

  isloadingEntreAutre: boolean = false;

  ajouterEntreeAutres(): void {
    this.isloadingEntreAutre = true;

    const formData = this.entreFormAutre.value;

    this.entreService.ajouterEntreeAutres(formData).subscribe({
      next: (response) => {
        console.log('Entrée ajoutée avec succès:', response);
        this.fetchAllEntre();
        this.entreFormAutre.patchValue({
          nomCLient: '',
          montantClient: '',
        });
        this.isloadingEntreAutre = false;
        alert('Entrée ajoutée avec succès !');
      },
      error: (error) => {
        this.isloadingEntreAutre = false;
        console.error(error.error.message);
        alert(error.error.message);
      },
    });
  }

  ajouterEntres(): void {
    console.log(this.entreForm.value);
    this.isLoading = true;
    const formData = this.entreForm.value;

    this.entreService.ajouterEntree(formData).subscribe({
      next: (response) => {
        console.log('Entrée ajoutée avec succès:', response);
        this.fetchAllEntre();
        this.entreForm.patchValue({
          partenaireId: '',
          deviseId: '',
          expediteur: '',
          receveur: '',
          montant_cfa: '',
          telephone_receveur: '',
        });
        this.isLoading = false;
        alert('Entrée ajoutée avec succès !');
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error.error.message);
        alert(error.error.message);
      },
    });
  }

  code: string = '';

  selectedRowId: number | null = null;

  // Sélectionner la ligne à imprimer
  printRow(user: any) {
    this.selectedRowId = user.id;
  }

  // Informations de l'utilisateur connecté
  userInfo: any = null;
  idUser: string = '';

  // Tableau pour stocker les résultats des entrées

  // Formulaire pour ajouter une entrée
  entreForm!: FormGroup;

  entreFormAutre!: FormGroup;

  annulerEntreForm!: FormGroup;

  isLoading: boolean = false;

  // Injection des dépendances nécessaires
  constructor(
    private entreService: EntreServiceService,
    private authService: AuthService,
    private deviseService: DeviseService,
    private partenaireService: PartenaireServiceService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  onEdit(devise: any) {
    this.selectedDevise = devise;
    this.editDeviseForm.patchValue({
      paysArriver: devise.paysArriver,
      signe_2: devise.signe_2,
      prix_1: devise.prix_1,
      prix_2: devise.prix_2,
    });
  }

  // Initialisation du composant
  ngOnInit(): void {
    this.editDeviseForm = this.fb.group({
      paysArriver: ['', Validators.required],
      signe_2: ['', Validators.required],
      prix_1: ['', Validators.required],
      prix_2: ['', Validators.required],
    });
    this.initFormAutres();
    this.initForm(); // Initialisation du formulaire
    this.fetchAllEntre(); // Récupération des données existantes
    this.fetchDevise();
    this.fetchPartenaire();
    this.getUserInfo(); // Récupération des infos utilisateur
    this.initAnnulerEntreForm();
  }

  private initAnnulerEntreForm(): void {
    this.annulerEntreForm = this.fb.group({
      codeAnnuler: ['', Validators.required],
      typeAnnuler: ['', Validators.required],
      montant_rembourser: [0],
    });

    // this.annulerEntreForm = this.fb.group({
    //   codeAnnuler: ['', Validators.required],
    //   typeAnnuler: ['', Validators.required],
    //   montant_rembourser: [0],
    // });
  }

  selectedDevise: any = null; // Devise sélectionnée pour modification
  isloadingEdit: boolean = false;

  onUpdate() {
    this.isloadingEdit = true;
    if (this.editDeviseForm.valid && this.selectedDevise) {
      const updatedData = this.editDeviseForm.value;
      this.deviseService
        .modifierDevise(this.selectedDevise.id, updatedData)
        .subscribe({
          next: (response) => {
            this.isloadingEdit = false;
            this.fetchDevise();
            alert('Devise modifiée avec succès!');
          },
          error: (error) => {
            console.error('Erreur lors de la modification du devise:', error);
            alert('Erreur lors de la modification du devise.');
          },
        });
    }
  }

  isLoadingAnnuler: boolean = false;

  annulerEntre(): void {
    this.isLoadingAnnuler = true;
    const { codeAnnuler, typeAnnuler, montant_rembourser } =
      this.annulerEntreForm.value;
    this.entreService
      .annulerEntreParCode(codeAnnuler, typeAnnuler, montant_rembourser)
      .subscribe({
        next: (response) => {
          console.log('Réponse du serveur:', response);
          this.fetchAllEntre();
          this.annulerEntreForm.reset();
          this.annulerEntreForm.markAsPristine();
          this.annulerEntreForm.markAsUntouched();
          this.annulerEntreForm.updateValueAndValidity();

          this.isLoadingAnnuler = false;
          alert(response.message);
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.isLoadingAnnuler = false;
          alert(error.error.message);
        },
      });
  }

  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        this.userInfo = response.user;
        //   if (this.userInfo) {
        this.idUser = this.userInfo.id;
        console.log('Informations utilisateur:', this.userInfo);
        this.initFormAutres();
        // Mettre à jour le champ utilisateurId dans le formulaire
        this.entreForm.patchValue({ utilisateurId: this.idUser });
      },
    });
  }

  private initFormAutres(): void {
    this.entreFormAutre = this.fb.group({
      utilisateurId: [this.idUser],
      nomCLient: ['', Validators.required],
      montantClient: [0, Validators.required],
    });
  }

  // Initialisation du formulaire avec des validations
  private initForm(): void {
    this.entreForm = this.fb.group({
      utilisateurId: [this.idUser], // Liaison utilisateurId
      partenaireId: ['', Validators.required],
      deviseId: ['', Validators.required], // Initialisé à vide
      expediteur: ['', Validators.required],
      receveur: ['', Validators.required],
      montant_cfa: [0, Validators.required],
      montant: [0, Validators.required],
      telephone_receveur: ['', Validators.required],
    });
  }

  allPartenaire: any[] = [];

  // Récupération des devises
  fetchPartenaire(): void {
    this.partenaireService.getAllPartenaire().subscribe(
      (response) => {
        this.allPartenaire = response;
        console.log('Liste des partenaires:', this.allPartenaire);
      },
      (error) => {
        console.error('Erreur lors de la récupération des partenaires:', error);
      }
    );
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
}
