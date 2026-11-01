import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HoraireInterface } from './horaire-interface';

@Injectable({
  providedIn: 'root',
})
export class HoraireService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/horaires';

  // API Platform renvoie la liste dans "member"
  getHoraires(): Observable<{ member: HoraireInterface[] }> {
    return this.http.get<{ member: HoraireInterface[] }>(this.api);
  }

  // Ajouter un horaire d'ouverture (admin ou gestionnaire de la salle)
  creerHoraire(horaire: HoraireInterface): Observable<HoraireInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<HoraireInterface>(this.api, horaire, { headers });
  }

  modifierHoraire(id: number, horaire: Partial<HoraireInterface>): Observable<HoraireInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<HoraireInterface>(`${this.api}/${id}`, horaire, { headers });
  }

  supprimerHoraire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
