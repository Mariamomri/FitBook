import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeanceInterface } from './seance-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SeanceService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/api';

  // API Platform renvoie la liste dans "member"
  getSeances(): Observable<{ member: SeanceInterface[] }> {
    return this.http.get<{ member: SeanceInterface[] }>(`${this.api}/seances`);
  }

  // Séances d'un seul cours (filtre côté Symfony)
  getSeancesDuCours(idCours: number): Observable<{ member: SeanceInterface[] }> {
    return this.http.get<{ member: SeanceInterface[] }>(`${this.api}/seances?cours=${idCours}`);
  }

  // Réserver : on envoie seulement la séance, Symfony ajoute l'utilisateur connecté
  // Symfony renvoie la réservation créée (avec son numéro, ex. FB-2026-000123)
  reserver(idSeance: number): Observable<{ id: number; numero: string }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<{ id: number; numero: string }>(
      `${this.api}/reservations`,
      { seance: `/api/seances/${idSeance}` },
      { headers },
    );
  }

  // Une séance par son id (page de confirmation)
  getUneSeance(id: number): Observable<SeanceInterface> {
    return this.http.get<SeanceInterface>(`${this.api}/seances/${id}`);
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
