import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DisponibiliteInterface } from './disponibilite-interface';

@Injectable({
  providedIn: 'root',
})
export class DisponibiliteService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/disponibilites';

  // API Platform renvoie la liste dans "member"
  getDisponibilites(): Observable<{ member: DisponibiliteInterface[] }> {
    return this.http.get<{ member: DisponibiliteInterface[] }>(this.api);
  }

  // Ajouter un créneau (le coach lui-même ou l'admin)
  creerDisponibilite(disponibilite: DisponibiliteInterface): Observable<DisponibiliteInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<DisponibiliteInterface>(this.api, disponibilite, { headers });
  }

  modifierDisponibilite(id: number, disponibilite: Partial<DisponibiliteInterface>): Observable<DisponibiliteInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<DisponibiliteInterface>(`${this.api}/${id}`, disponibilite, { headers });
  }

  supprimerDisponibilite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
