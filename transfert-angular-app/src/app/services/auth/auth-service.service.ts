import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; 
  private userInfo: any = null;  // Stocke les informations de l'utilisateur


  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/login`, { email, password });
  }

    // Sauvegarder les informations de l'utilisateur après connexion
    setUserInfo(userInfo: any): void {
      console.log('User Info:', userInfo);
      this.userInfo = userInfo;
      localStorage.setItem('userInfo', JSON.stringify(userInfo)); // Optionnel : sauvegarder dans localStorage
    }
  
    // Récupérer les informations de l'utilisateur connecté
    getUserInfo(): any {
      if (this.userInfo) {
        // console.log('Returning cached user info:', this.userInfo);
        return this.userInfo;
      } else if (typeof window !== 'undefined' && window.localStorage) {
        // Charger depuis localStorage si les informations ne sont pas en mémoire
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          this.userInfo = JSON.parse(storedUserInfo);
          // console.log('Returning user info from localStorage:', this.userInfo);
          return this.userInfo;
        }
      }
      return null;
    }
  
    // Vérification si l'utilisateur est authentifié
    isAuthenticated(): boolean {
      const token = this.getToken();
      if (!token) {
        return false; // Pas de token, donc non authentifié
      }
  
      const expiry = this.getTokenExpiry(token);
      if (expiry === null) {
        return false; // Si l'expiration est null, l'utilisateur n'est pas authentifié
      }
      return expiry > Date.now(); // Vérifie si le token est encore valide
    }
  
    // Sauvegarder le token dans le stockage local
    saveToken(token: string): void {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', token);
      }
    }
  
    // Récupérer le token du stockage local
    getToken(): string | null {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('token');
      }
      return null;
    }
  
    // Déconnexion de l'utilisateur
    logout(): void {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        this.userInfo = null;
      }
    }
  
    // Fonction pour récupérer l'expiration du token
    private getTokenExpiry(token: string): number | null {
      try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Décodage du payload du JWT
        return payload.exp ? payload.exp * 1000 : null; // L'expiration est en secondes
      } catch (e) {
        return null; // Token invalide
      }
    }
}
