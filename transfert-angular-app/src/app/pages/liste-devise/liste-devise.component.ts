import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DeviseService } from '../../services/devise/devise.service';
import { AuthService } from '../../services/auth/auth-service.service';
import { Subject } from 'rxjs';
import { DataTablesModule } from 'angular-datatables';

@Component({
  selector: 'app-liste-devise',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTablesModule],
  templateUrl: './liste-devise.component.html',
  styleUrl: './liste-devise.component.css'
})
export class ListeDeviseComponent implements OnInit {
  allresultat: any[] = [];
  deviseForm!: FormGroup;
  editDeviseForm!: FormGroup;

  userInfo: any = null;
  idUser: string = '';

  dtoptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  selectedDevise: any = null; // Devise sélectionnée pour modification

  isLoading: boolean = false;

  constructor(private devise: DeviseService, private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.dtoptions = {
      paging: true,
      pagingType: 'full_numbers',
      pageLength: 10
    };

    this.deviseForm = this.fb.group({
      utilisateurId: ['', Validators.required],
      paysArriver: ['', Validators.required],
      signe_2: ['', Validators.required],
      prix_1: ['', Validators.required],
      prix_2: ['', Validators.required],
    });

    this.editDeviseForm = this.fb.group({
      paysArriver: ['', Validators.required],
      signe_2: ['', Validators.required],
      prix_1: ['', Validators.required],
      prix_2: ['', Validators.required],
    });

    this.getAllDevise();
    this.getUserInfo();
  }

  getAllDevise() {
    this.devise.getAllDevise().subscribe({
      next: (response) => {
        this.allresultat = response;
        if ($.fn.DataTable.isDataTable('#devise-table')) {
          $('#devise-table').DataTable().clear().destroy();
        }
        // if (this.allresultat && this.allresultat.length > 0) {
        //   this.dtTrigger.next(null);
        // }
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
        this.deviseForm.patchValue({ utilisateurId: this.idUser });
      }
    });
  }

  onSubmit() {
    if (this.deviseForm.valid) {
      const formData = this.deviseForm.value;
      this.isLoading = true;
      this.devise.ajouterDevise(formData).subscribe(
        response => {
          this.isLoading = false;
          this.getAllDevise();
          this.deviseForm.reset();
          alert('Devise ajoutée avec succès!');
        },
        error => {
          console.error('Erreur lors de l\'ajout du devise:', error);
          alert('Erreur lors de l\'ajout du devise.');
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

  onEdit(devise: any) {
    this.selectedDevise = devise;
    this.editDeviseForm.patchValue({
      paysArriver: devise.paysArriver,
      signe_2: devise.signe_2,
      prix_1: devise.prix_1,
      prix_2: devise.prix_2,
    });
  }

  onUpdate() {
    if (this.editDeviseForm.valid && this.selectedDevise) {
      const updatedData = this.editDeviseForm.value;
      this.devise.modifierDevise(this.selectedDevise.id, updatedData).subscribe(
        response => {
          this.getAllDevise();
          alert('Devise modifiée avec succès!');
        },
        error => {
          console.error('Erreur lors de la modification du devise:', error);
          alert('Erreur lors de la modification du devise.');
        }
      );
    }
  }
}
