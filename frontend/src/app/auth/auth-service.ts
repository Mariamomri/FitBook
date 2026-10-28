import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/login_check';

  // true si un token existe : l'utilisateur est connecté
  connecte = signal(!!localStorage.getItem('token'));

  // Envoie email + mot de passe à Symfony, qui renvoie un token JWT
  login(email: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(this.api, { username: email, password: password });
  }

  // Garde le token dans le navigateur (il survit au rechargement de la page)
  saveToken(token: string): void {
    localStorage.setItem('token', token);
    this.connecte.set(true);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.connecte.set(false);
  }
}