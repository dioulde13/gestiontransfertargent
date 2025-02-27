import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup,FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { PayementService } from '../../services/payements/payement.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';

interface Result {
  code: string;
  date_creation: string;
  montant: number;
  id: number;
}

@Component({
  selector: 'app-payements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './payements.component.html',
  styleUrl: './payements.component.css'
})
export class PayementsComponent implements OnInit, AfterViewInit {

  allresultat: Result[] = [];
  private dataTable: any;

  userInfo: any = null;
  idUser: string = '';
  payementForm!: FormGroup;

  // dtoptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private payementService: PayementService,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.payementForm = this.fb.group({
      utilisateurId: [this.idUser],
      code: ['', Validators.required],
      montant: ['', Validators.required],
    });
    this.filteredResults = [...this.allresultat];
    this.getUserInfo();
    this.getAllPayement();
  }

  filteredResults: any[] = [];

  startDate: Date | null = null;
  endDate: Date | null = null;

  totalMontant: number = 0; // Initialisation
  filtrerEntreDates(): void {
    const startDateInput = (document.getElementById('startDate') as HTMLInputElement).value;
    const endDateInput = (document.getElementById('endDate') as HTMLInputElement).value;
  
    this.startDate = startDateInput ? new Date(startDateInput) : null;
    this.endDate = endDateInput ? new Date(endDateInput) : null;

      // Filtrer d'abord par date
    let filteredResults = this.allresultat.filter((result: { date_creation: string }) => {
      const resultDate = new Date(result.date_creation);
      return (!this.startDate || resultDate >= this.startDate) && 
             (!this.endDate || resultDate <= this.endDate);
    });
  
    // Mettre à jour DataTable avec les résultats filtrés par date
    this.dataTable.clear().rows.add(filteredResults).draw();
  
    // Attendre que DataTable applique son propre filtre (search)
    setTimeout(() => {
      const filteredDataTable: { montant: number }[] = this.dataTable
        .rows({ search: 'applied' })
        .data()
        .toArray();
  
      // Recalculer le total avec des types explicitement définis
      this.totalMontant = filteredDataTable.reduce((sum: number, row: { montant: number }) => {
        return sum + row.montant;
      }, 0);
  
      console.log('Total Montant après filtre et recherche :', this.totalMontant);
    }, 200); // Timeout pour attendre la mise à jour de DataTable

  }
  


  getAllPayement() {
    this.payementService.getAllPayement().subscribe({
      next: (response) => {
        this.allresultat = response;
        this.initDataTable();
        this.cd.detectChanges(); 
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données', error);
      },
    });
  }


  private initDataTable(): void {
    setTimeout(() => {
      if (this.dataTable) {
        this.dataTable.destroy();
      }
      this.dataTable = ($('#datatable') as any).DataTable({
        dom: "<'row'<'col-sm-6 dt-buttons-left'B><'col-sm-6 text-end dt-search-right'f>>" +
          "<'row'<'col-sm-12'tr>>" +
          "<'row'<'col-sm-5'i><'col-sm-7'p>>",
        buttons: ['csv', 'excel', 'pdf', 'print'],
        paging: true,
        searching: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50],
        data: this.allresultat,
        order: [[0, 'desc']],
        columns: [
          {
            title: "Date paiement",
            data: "date_creation",
            render: (data: string, type: any, row: any) => {
              if (!data || !row.Entre) return '';
              const date = new Date(data);
              const formattedDate = date.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              return `${row.Entre.pays_dest} / ${row.Entre.code} / ${row.Entre.expediteur} / ${formattedDate}`;
            }
          },
          {
            title: "Montant",
            data: "montant",
            render: (data: number) => {
              return new Intl.NumberFormat('fr-FR', {
                style: 'decimal',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(data) + " GNF";
            }
          },
        ]
      });
      this.cd.detectChanges(); // Force la détection des changements
    }, 100);
  }
  

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }



  getUserInfo() {
    this.authService.getUserInfo().subscribe({
      next: (response) => {
        this.userInfo = response.user;
        this.idUser = this.userInfo.id;
        this.payementForm.patchValue({ utilisateurId: this.idUser });
      }
    });
  }

  onSubmit() {
    if (this.payementForm.valid) {
      const formData = this.payementForm.value;
      this.loading = true;
  
      this.payementService.ajouterPayement(formData).subscribe(
        response => {
          this.loading = false;
          this.payementForm.reset();
          this.getAllPayement();
          alert(response.message); // Afficher le message retourné par l'API
        },
        error => {
          this.loading = false;
          const errorMessage = error.error?.message || "Erreur lors de l'ajout du paiement.";
          alert(errorMessage); // Afficher le message d'erreur retourné par l'API
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }
  

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe(); // Nettoyage
  }
}



  // // Détruire l'ancienne instance de DataTable si elle existe
  // if ($.fn.DataTable.isDataTable('#transactions-table')) {
  //   $('#transactions-table').DataTable().clear().destroy();
  // }

  // // Initialiser DataTable après un court délai
  // setTimeout(() => {
  //   let table = $('#transactions-table').DataTable(this.dtoptions);

  //   const calculateTotal = () => {
  //     let total = 0;
  //     let visibleRows = table.rows(':visible').data().length; // Nombre de lignes visibles

  //     if (visibleRows > 0) {
  //       table.rows(':visible').every(function () {
  //         let rowData = this.data();
  //         let montant = parseFloat(
  //           rowData[1].toString().replace(/\s/g, '').replace(/,/g, '')
  //         ) || 0;

  //         total += montant;
  //       });
  //     }

  //     // Afficher le total uniquement si un filtre est actif
  //     if (visibleRows > 0 && (startDateObj || endDateObj)) {
  //       $('#totalMontant').html(
  //         `<strong>Total Montant GNF :</strong> ${total.toLocaleString()} GNF`
  //       );
  //     } else {
  //       $('#totalMontant').html(`<strong>Total Montant GNF :</strong> 0 GNF`);
  //     }
  //   };

  //   let startDateObj: Date | null = null;
  //   let endDateObj: Date | null = null;

  //   // Fonction de filtrage des dates
  //   $('#btnFilter').on('click', function () {
  //     let startDate = ($('#startDate').val() as string);
  //     let endDate = ($('#endDate').val() as string);

  //     startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
  //     endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;

  //     table.rows().every(function () {
  //       let rowData = this.data();
  //       console.log(rowData);
      
  //       // Extraction de la chaîne de date depuis la première colonne
  //       let dateStr = rowData[0];
  //       console.log(dateStr);
      
  //       if (dateStr) {
  //         // Séparer la chaîne par " / " pour obtenir chaque partie
  //         let parts = dateStr.split(' / ');
          
  //         // La date et l'heure sont dans la dernière partie après le dernier "/"
  //         let lastPart = parts[parts.length - 1];
      
  //         // Extraire la date et l'heure séparément
  //         let [dateOnly, timePart] = lastPart.split(' '); // dateOnly = "02/02/2025", timePart = "16:05"
  //         console.log(dateOnly);
      
  //         if (dateOnly && timePart) {
  //           // Conversion de la date et de l'heure en objets numériques
  //           let [day, month, year] = dateOnly.split('/').map(Number);
  //           let [hours, minutes] = timePart.split(':').map(Number);
      
  //           // Création de l'objet Date
  //           let rowDate = new Date(year, month - 1, day, hours, minutes);
  //           console.log(rowDate);
      
  //           // Vérification si la date est comprise entre startDateObj et endDateObj
  //           if (
  //             (!startDateObj || rowDate >= startDateObj) &&
  //             (!endDateObj || rowDate <= endDateObj)
  //           ) {
  //             $(this.node()).show(); // Affiche la ligne si la condition est respectée
  //           } else {
  //             $(this.node()).hide(); // Cache la ligne sinon
  //           }
  //         }
  //       }
  //     });            

  //     table.draw();
  //     calculateTotal();
  //   });

  //   // Mettre à jour le total lors de la recherche
  //   table.on('search.dt', function () {
  //     calculateTotal();
  //   });

  //   // Afficher 0 par défaut
  //   $('#totalMontant').html(`<strong>Total Montant GNF :</strong> 0 GNF`);
  // }, 100);


// this.dtoptions = {
//   pagingType: 'full_numbers',
//   pageLength: 10,
//   processing: true,
//   order: [0,'desc'],
//   dom: "<'row'<'col-sm-6 dt-buttons-left'B><'col-sm-6 text-end dt-search-right'f>>" + 
//        "<'row'<'col-sm-12'tr>>" + 
//        "<'row'<'col-sm-5'i><'col-sm-7'p>>",
//   buttons: ['csv', 'excel', 'print'],
//   language: {
//       search: "Rechercher"
//   }
// };
