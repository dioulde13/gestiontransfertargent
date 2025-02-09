import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service.service';
import { CommonModule } from '@angular/common';
import { EntreServiceService } from '../../services/entre/entre-service.service';
import { response } from 'express';


@Component({
  selector: 'app-dasboard',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './dasboard.component.html',
  styleUrl: './dasboard.component.css'
})
export class DasboardComponent implements OnInit {

  userInfo: any = null;

  constructor(private authService: AuthService, private entreService: EntreServiceService) { }


  ngOnInit(): void {
    this.getUserInfo();
    this.getCompteEntre();
  }

  getUserInfo() {
    this.authService.getUserInfo().subscribe(
      {
        next: (response) => {
          this.userInfo = response.user;
          console.log(this.userInfo);
        }
      }
    );
  }
  entreDuJour: any;
  getCompteEntre(): void{
    this.entreService.getCompteEntrees().subscribe({
      next: (response) => {
        this.entreDuJour = response.nombre_entrees;
        console.log(this.entreDuJour); 
      }
    });
  }
}
