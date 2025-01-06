import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeviseService {

 // URL de l'API
     private apiUrl = 'http://localhost:3000'; 
   
     constructor(private http: HttpClient) { }
   
      // Méthode pour récupérer les données de l'API
      getAllDevise(): Observable<any> {
       return this.http.get(`${this.apiUrl}/api/devises/liste`);
     }
}
