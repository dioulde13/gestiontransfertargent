import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    console.log(email);
    console.log(password);

    return this.http.post(`${this.apiUrl}/api/auth/login`, { email, password });
  }

  isAuthenticated(): boolean {
    // Vérifier si on est dans le navigateur avant d'accéder à localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  saveToken(token: string): void {
    // Vérifier si on est dans le navigateur avant d'utiliser localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    // Vérifier si on est dans le navigateur avant d'utiliser localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('token');
    }
    return null;
  }

  logout(): void {
    // Vérifier si on est dans le navigateur avant d'utiliser localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
    }
  }

  getUserInfo(): Observable<any> {
    const token = this.getToken();
    // console.log(token)
    if (token) {
      // Ajout du token dans l'en-tête de la requête pour l'authentification
      const headers = { Authorization: `Bearer ${token}` };
      return this.http.get(`/api/user/info`, { headers });
    }
    return new Observable(observer => observer.error('No token found'));
  }
}
