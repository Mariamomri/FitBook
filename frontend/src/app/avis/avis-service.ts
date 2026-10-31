import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AvisInterface } from './avis-interface';

@Injectable({
  providedIn: 'root',
})
export class AvisService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/avis';

  // API Platform renvoie la liste dans "member"
  getAvis(): Observable<{ member: AvisInterface[] }> {
    return this.http.get<{ member: AvisInterface[] }>(this.api);
  }

  // Modération par l'admin : publie ou refuse
  changerStatut(id: number, statut: string): Observable<AvisInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<AvisInterface>(`${this.api}/${id}`, { statut }, { headers });
  }

  supprimerAvis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // Laisser un avis sur une réservation (le sportif connecté, email confirmé)
  creerAvis(avis: AvisInterface): Observable<AvisInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<AvisInterface>(this.api, avis, { headers });
  }

  // Modifier sa note ou son commentaire
  modifierAvis(id: number, avis: Partial<AvisInterface>): Observable<AvisInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<AvisInterface>(`${this.api}/${id}`, avis, { headers });
  }

  // Les étoiles affichées partout sur le site : 4 → "★★★★☆"
  etoiles(note: number): string {
    return '★'.repeat(note) + '☆'.repeat(5 - note);
  }
}
