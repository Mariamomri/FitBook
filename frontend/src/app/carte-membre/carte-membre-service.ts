import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CarteMembreAdminInterface, CarteMembreInterface } from './carte-membre-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CarteMembreService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/api';

  // Ma carte (null si je n'en ai pas encore)
  getMaCarte(): Observable<CarteMembreInterface | null> {
    return this.http.get<CarteMembreInterface | null>(`${this.api}/me/carte`);
  }

  // Demander ma carte ou la renouveler quand elle a expiré
  demanderCarte(): Observable<CarteMembreInterface> {
    return this.http.post<CarteMembreInterface>(`${this.api}/me/carte`, {});
  }

  // Admin : toutes les cartes
  getCartes(): Observable<{ member: CarteMembreAdminInterface[] }> {
    return this.http.get<{ member: CarteMembreAdminInterface[] }>(`${this.api}/carte_membres`);
  }

  // Admin : changer le statut (active, suspendue...)
  modifierCarte(id: number, carte: Partial<CarteMembreAdminInterface>): Observable<CarteMembreAdminInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<CarteMembreAdminInterface>(`${this.api}/carte_membres/${id}`, carte, { headers });
  }

  supprimerCarte(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/carte_membres/${id}`);
  }

  libelleStatut(statut: string): string {
    return statut === 'active' ? 'Active' : statut === 'suspendue' ? 'Suspendue' : 'Expirée';
  }
}
