import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActiviteInterface } from './activite-interface';

@Injectable({
  providedIn: 'root',
})
export class ActiviteService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/activites';

  // API Platform renvoie la liste dans "member"
  getActivites(): Observable<{ member: ActiviteInterface[] }> {
    return this.http.get<{ member: ActiviteInterface[] }>(this.api);
  }

  // Ajouter une activité (admin ou gestionnaire)
  creerActivite(activite: ActiviteInterface): Observable<ActiviteInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<ActiviteInterface>(this.api, activite, { headers });
  }

  modifierActivite(id: number, activite: Partial<ActiviteInterface>): Observable<ActiviteInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<ActiviteInterface>(`${this.api}/${id}`, activite, { headers });
  }

  supprimerActivite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
