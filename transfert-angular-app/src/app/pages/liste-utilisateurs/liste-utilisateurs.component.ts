import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UtilisateurService } from '../../services/utilisateurs/utilisateur.service';
import { AuthService } from '../../services/auth/auth-service.service';

// Interface utilisateur
interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  date_creation: string;
  email: string;
  password: string;
  role: string;
  btEnabled: boolean;
}

@Component({
  selector: 'app-liste-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './liste-utilisateurs.component.html',
  styleUrl: './liste-utilisateurs.component.css',
})
export class ListeUtilisateursComponent implements OnInit {
  user: User = this.getEmptyUser();
  users: User[] = [];
  filteredUsers: User[] = [];
  errorMessage: string = '';
  userInfo: any = null; // Informations de l'utilisateur connecté

  // Recherche et filtres
  searchTerm: string = '';
  selectedRole: string = '';

  // Gestion des modales
  isAddUserModalOpen: boolean = false; // Modale d'ajout
  isEditStatusModalOpen: boolean = false; // Modale de modification de statut
  selectedUserId: number | null = null; // ID utilisateur sélectionné pour modification
  btEnabled: boolean = false; // Statut actuel de l'utilisateur sélectionné

  constructor(
    private utilisateurService: UtilisateurService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.userInfo = this.authService.getUserInfo();
    console.log('Informations utilisateur:', this.userInfo);
  }

  // Récupérer un utilisateur vide
  private getEmptyUser(): User {
    return {
      id: 0,
      nom: '',
      prenom: '',
      telephone: '',
      date_creation: '',
      email: '',
      password: '',
      role: '',
      btEnabled: true,
    };
  }

  /** Gestion des notifications */
  showNotification(message: string): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  /** Gestion de la recherche et des filtres */
  rechercherUsers(): User[] {
    if (!this.searchTerm) {
      return this.users;
    }
    return this.users.filter(user =>
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.telephone.includes(this.searchTerm)
    );
  }

  filterByRole(): void {
    this.filteredUsers = this.selectedRole
      ? this.users.filter(user => user.role === this.selectedRole)
      : [...this.users];
  }

  /** Récupérer les utilisateurs */
  fetchUsers(): void {
    this.utilisateurService.getUsers().subscribe({
      next: (response) => {
        const currentUserEmail = this.userInfo?.user?.email || '';
        this.users = response
          .filter((user: User) => user.email !== currentUserEmail)
          .sort((a: User, b: User) => b.id - a.id); // Trier par ID décroissant
        this.filteredUsers = [...this.users];
      },
      error: (error) => {
        this.errorMessage = `Erreur : ${error.message}`;
        console.error('Erreur lors de la récupération des utilisateurs :', error);
      },
    });
  }

  /** Modale d'ajout d'utilisateur */
  openAddUserModal(): void {
    // this.resetForm();
    this.isAddUserModalOpen = true;
  }

  closeAddUserModal(): void {
    this.isAddUserModalOpen = false;
  }

  addUser(): void {
    if (this.isValidForm()) {
      this.utilisateurService.addUser(this.user).subscribe({
        next: () => {
          this.showNotification('Utilisateur ajouté avec succès !');
          this.fetchUsers();
          this.closeAddUserModal();
        },
        error: (error) => {
          this.showNotification('Erreur lors de l\'ajout de l\'utilisateur.');
          console.error('Erreur :', error);
        },
      });
    } else {
      this.showNotification('Veuillez remplir tous les champs obligatoires.');
    }
  }

  /** Modale de modification de statut */
  openEditStatusModal(user: User): void {
    this.selectedUserId = user.id;
    this.btEnabled = !user.btEnabled;
    this.isEditStatusModalOpen = true;
  }

  closeEditStatusModal(): void {
    this.isEditStatusModalOpen = false;
    this.selectedUserId = null;
    this.btEnabled = false;
  }

  modifierStatus(): void {
    if (this.selectedUserId === null) {
      this.showNotification('Aucun utilisateur sélectionné pour la modification.');
      return;
    }

    this.utilisateurService.updateStatusUtilisateur(this.selectedUserId, this.btEnabled).subscribe({
      next: () => {
        this.showNotification('Le statut de l\'utilisateur a été modifié avec succès !');
        this.fetchUsers();
        this.closeEditStatusModal();
      },
      error: (error) => {
        const message = error.status === 400 && error.error?.message
          ? error.error.message
          : `Erreur lors de la mise à jour : ${error.message}`;
        this.showNotification(message);
      },
    });
  }

  /** Utilitaires */
  resetForm(): void {
    this.user = this.getEmptyUser();
  }

  isValidForm(): boolean {
    return (
      this.user.nom.trim() !== '' &&
      this.user.prenom.trim() !== '' &&
      this.user.telephone.trim() !== '' &&
      this.user.email.trim() !== '' &&
      this.user.password.trim() !== '' &&
      this.user.role.trim() !== ''
    );
  }
}
