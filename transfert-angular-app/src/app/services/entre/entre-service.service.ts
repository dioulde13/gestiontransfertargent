import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EntreServiceService {

  // URL de l'API
   private apiUrl = 'http://localhost:3000'; 
 
   constructor(private http: HttpClient) { }
 
   // Méthode pour récupérer les données de l'API
   getData(): Observable<any> {
     return this.http.get(`${this.apiUrl}/api/devises/liste`);
   }
    // Méthode pour récupérer les données de l'API
    getAllEntree(): Observable<any> {
     return this.http.get(`${this.apiUrl}/api/entrees/liste`);
   }

    // Méthode pour récupérer les données de l'API
    getCompteEntrees(): Observable<any> {
      return this.http.get(`${this.apiUrl}/api/entrees/compte`);
    }

    // Méthode pour ajouter une nouvelle entrée
  ajouterEntree(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/entrees/create`, data);
  }
}
