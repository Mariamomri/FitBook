import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoursInterface } from './cours-interface';

@Injectable({
  providedIn: 'root',
})
export class CoursService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/cours';

  // API Platform renvoie la liste dans "member"
  getCours(): Observable<{ member: CoursInterface[] }> {
    return this.http.get<{ member: CoursInterface[] }>(this.api);
  }

  // Un seul cours par son id
  getUnCours(id: number): Observable<CoursInterface> {
    return this.http.get<CoursInterface>(`${this.api}/${id}`);
  }

  // Ajouter un cours (admin, gestionnaire de la salle ou coach)
  creerCours(cours: Partial<CoursInterface>): Observable<CoursInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<CoursInterface>(this.api, cours, { headers });
  }

  // Modifier un cours : seulement les champs changés (merge-patch)
  modifierCours(id: number, cours: Partial<CoursInterface>): Observable<CoursInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<CoursInterface>(`${this.api}/${id}`, cours, { headers });
  }

  supprimerCours(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
