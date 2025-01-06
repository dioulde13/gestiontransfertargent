import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PartenaireServiceService {

 // URL de l'API
    private apiUrl = 'http://localhost:3000'; 
  
    constructor(private http: HttpClient) { }
  
     // Méthode pour récupérer les données de l'API
     getAllPartenaire(): Observable<any> {
      return this.http.get(`${this.apiUrl}/api/partenaires/liste`);
    }
}
