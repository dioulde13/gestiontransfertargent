import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { PayementService } from '../../services/payements/payement.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';

@Component({
  selector: 'app-payements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTablesModule],
  templateUrl: './payements.component.html',
  styleUrl: './payements.component.css'
})
export class PayementsComponent implements OnInit, OnDestroy {
  allresultat: any[] = [];
  userInfo: any = null;
  idUser: string = '';
  payementForm!: FormGroup;
  dtoptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private payementService: PayementService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.dtoptions = {
      paging: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      stateSave: true,
      destroy: true
    };

    this.payementForm = this.fb.group({
      utilisateurId: [this.idUser],
      code: ['', Validators.required],
      montant: ['', Validators.required],
    });

    this.getUserInfo();
    this.getAllPayement();
  }

  getAllPayement() {
    this.payementService.getAllPayement().subscribe({
      next: (response) => {
        this.allresultat = response;

        // Détruire l'ancienne instance de DataTable si elle existe
        if ($.fn.DataTable.isDataTable('#transactions-table')) {
          $('#transactions-table').DataTable().clear().destroy();
        }

        // Initialiser DataTable après un court délai
        setTimeout(() => {
          let table = $('#transactions-table').DataTable({
            pagingType: 'full_numbers',
            pageLength: 10,
            stateSave: true,
            destroy: true,
          });

          const calculateTotal = () => {
            let total = 0;
            let visibleRows = table.rows(':visible').data().length; // Nombre de lignes visibles

            if (visibleRows > 0) {
              table.rows(':visible').every(function () {
                let rowData = this.data();
                let montant = parseFloat(
                  rowData[1].toString().replace(/\s/g, '').replace(/,/g, '')
                ) || 0;

                total += montant;
              });
            }

            // Afficher le total uniquement si un filtre est actif
            if (visibleRows > 0 && (startDateObj || endDateObj)) {
              $('#totalMontant').html(
                `<strong>Total Montant GNF :</strong> ${total.toLocaleString()} GNF`
              );
            } else {
              $('#totalMontant').html(`<strong>Total Montant GNF :</strong> 0 GNF`);
            }
          };

          let startDateObj: Date | null = null;
          let endDateObj: Date | null = null;

          // Fonction de filtrage des dates
          $('#btnFilter').on('click', function () {
            let startDate = ($('#startDate').val() as string);
            let endDate = ($('#endDate').val() as string);

            startDateObj = startDate ? new Date(startDate + 'T00:00:00') : null;
            endDateObj = endDate ? new Date(endDate + 'T23:59:59') : null;

            table.rows().every(function () {
              let rowData = this.data();
              console.log(rowData);
            
              // Extraction de la chaîne de date depuis la première colonne
              let dateStr = rowData[0];
              console.log(dateStr);
            
              if (dateStr) {
                // Séparer la chaîne par " / " pour obtenir chaque partie
                let parts = dateStr.split(' / ');
                
                // La date et l'heure sont dans la dernière partie après le dernier "/"
                let lastPart = parts[parts.length - 1];
            
                // Extraire la date et l'heure séparément
                let [dateOnly, timePart] = lastPart.split(' '); // dateOnly = "02/02/2025", timePart = "16:05"
                console.log(dateOnly);
            
                if (dateOnly && timePart) {
                  // Conversion de la date et de l'heure en objets numériques
                  let [day, month, year] = dateOnly.split('/').map(Number);
                  let [hours, minutes] = timePart.split(':').map(Number);
            
                  // Création de l'objet Date
                  let rowDate = new Date(year, month - 1, day, hours, minutes);
                  console.log(rowDate);
            
                  // Vérification si la date est comprise entre startDateObj et endDateObj
                  if (
                    (!startDateObj || rowDate >= startDateObj) &&
                    (!endDateObj || rowDate <= endDateObj)
                  ) {
                    $(this.node()).show(); // Affiche la ligne si la condition est respectée
                  } else {
                    $(this.node()).hide(); // Cache la ligne sinon
                  }
                }
              }
            });            

            table.draw();
            calculateTotal();
          });

          // Mettre à jour le total lors de la recherche
          table.on('search.dt', function () {
            calculateTotal();
          });

          // Afficher 0 par défaut
          $('#totalMontant').html(`<strong>Total Montant GNF :</strong> 0 GNF`);
        }, 100);

      },
      error: (error) => {
        console.error('Erreur lors de la récupération des données', error);
      },
    });
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
          alert('Paiement ajouté avec succès!');
        },
        error => {
          this.loading = false;
          alert('Erreur lors de l\'ajout du paiement.');
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
