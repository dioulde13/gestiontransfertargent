import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalculBeneficeService {

  private apiUrl = 'http://localhost:3000/api/calculBenefices/benefice';  // L'URL de votre API

  constructor(private http: HttpClient) {}

  calculerBenefice(dateDebut: string, dateFin: string, montant: number, prix_1: number, prix: number): Observable<any> {
    const body = { dateDebut, dateFin, montant, prix_1, prix };
    return this.http.post<any>(this.apiUrl, body);
  }

}
