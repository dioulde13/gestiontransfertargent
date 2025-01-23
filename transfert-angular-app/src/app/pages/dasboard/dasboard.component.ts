import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dasboard',
  imports: [],
  templateUrl: './dasboard.component.html',
  styleUrl: './dasboard.component.css'
})
export class DasboardComponent implements OnInit{

    userInfo: any = null;
  
    constructor(private authService: AuthService, private router: Router) {}
  
    ngOnInit(): void {
      // Récupérer les informations de l'utilisateur connecté
      this.userInfo = this.authService.getUserInfo();
      console.log('Informations utilisateur:', this.userInfo);
    }
}
