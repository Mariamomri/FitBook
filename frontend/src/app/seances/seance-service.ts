import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeanceInterface } from './seance-interface';

@Injectable({
  providedIn: 'root',
})
export class SeanceService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api';

  // API Platform renvoie la liste dans "member"
  getSeances(): Observable<{ member: SeanceInterface[] }> {
    return this.http.get<{ member: SeanceInterface[] }>(`${this.api}/seances`);
  }

  // Séances d'un seul cours (filtre côté Symfony)
  getSeancesDuCours(idCours: number): Observable<{ member: SeanceInterface[] }> {
    return this.http.get<{ member: SeanceInterface[] }>(`${this.api}/seances?cours=${idCours}`);
  }

  // Réserver : on envoie seulement la séance, Symfony ajoute l'utilisateur connecté
  reserver(idSeance: number): Observable<unknown> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post(`${this.api}/reservations`, { seance: `/api/seances/${idSeance}` }, { headers });
  }

  // Ajouter une séance à un cours (admin, gestionnaire de la salle ou coach du cours)
  creerSeance(seance: { cours: string; dateDebut: string; dateFin: string; statut: string }): Observable<SeanceInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<SeanceInterface>(`${this.api}/seances`, seance, { headers });
  }

  // Modifier une séance (par exemple la passer en « annulee »)
  modifierSeance(id: number, seance: Partial<SeanceInterface>): Observable<SeanceInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<SeanceInterface>(`${this.api}/seances/${id}`, seance, { headers });
  }

  supprimerSeance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/seances/${id}`);
  }
}
