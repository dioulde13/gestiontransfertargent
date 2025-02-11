import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth-service.service';
import { CommonModule } from '@angular/common';
import { EntreServiceService } from '../../services/entre/entre-service.service';
import { SortieService } from '../../services/sortie/sortie.service';
import { EchangeService } from '../../services/echanges/echange.service';
import { RembourserService } from '../../services/rembourser/rembourser.service';
import { PayementEchangeService } from '../../services/payementEchange/payement.service';
import { PayementService } from '../../services/payements/payement.service';
import { response } from 'express';
import { DepenseService } from '../../services/depenses/depense.service';


@Component({
  selector: 'app-dasboard',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './dasboard.component.html',
  styleUrl: './dasboard.component.css'
})
export class DasboardComponent implements OnInit {

  userInfo: any = null;

  constructor(
    private authService: AuthService,
     private entreService: EntreServiceService,
     private sortieSortie: SortieService,
     private echangeService: EchangeService,
     private payementEchange: PayementEchangeService,
     private rembourserService: RembourserService,
     private payementService: PayementService,
     private depenseService: DepenseService
    ) { }


  ngOnInit(): void {
    this.getUserInfo();
    this.getCompteEntre();
    this.getCompteSortie();
    this.getComptePayement();
    this.getCompteEchange();
    this.getComptePayementEchange();
    this.getCompteDuJour();
    this.getSommeMontantDepense();
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

  sortieDuJour: any;
  getCompteSortie(): void{
    this.sortieSortie.getCompteSortie().subscribe({
      next: (response) => {
        this.sortieDuJour = response.nombre_Sortie;
        console.log(this.sortieDuJour);
      }
    });
  }

  payementDuJour: any;
  getComptePayement(): void{
    this.payementService.getComptePayement().subscribe({
      next: (response) => {
        this.payementDuJour = response.nombre_payement;
        console.log(this.payementDuJour);
      }
    });
  }

  echangeDuJour: any;
  getCompteEchange(): void{
    this.echangeService.getCompteEchange().subscribe({
      next: (response) => {
        this.echangeDuJour = response.nombre_echange;
        console.log(this.echangeDuJour);
      }
    });
  }

  echangePayementDuJour: any;
  getComptePayementEchange(): void{
    this.payementEchange.getComptePayemenEchange().subscribe({
      next: (response) => {
        this.echangePayementDuJour = response.nombre_Payement_echange;
        console.log(this.echangePayementDuJour);
      }
    });
  }


  montantDepenseDuJour: any;
  getSommeMontantDepense(): void{
    this.depenseService.getCompteDepense().subscribe({
      next: (response) => {
        this.montantDepenseDuJour = response.totalDepense;
        console.log(this.montantDepenseDuJour);
      }
    });
  }

  retourDuJour: any;
  getCompteDuJour(): void{
    this.rembourserService.getCompteRembourser().subscribe({
      next: (response) => {
        this.retourDuJour = response.nombre_rembourser;
        console.log(this.retourDuJour);
      }
    });
  }
}
