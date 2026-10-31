import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoachInterface } from './coach-interface';

@Injectable({
  providedIn: 'root',
})
export class CoachService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/coaches';

  // API Platform renvoie la liste dans "member"
  getCoaches(): Observable<{ member: CoachInterface[] }> {
    return this.http.get<{ member: CoachInterface[] }>(this.api);
  }

  // Un coach par son id (fiche du coach)
  getUnCoach(id: number): Observable<CoachInterface> {
    return this.http.get<CoachInterface>(`${this.api}/${id}`);
  }

  // Photo envoyée par le coach, ou avatar par défaut s'il n'en a pas
  photo(coach: CoachInterface): string {
    return coach.imageName ? 'https://127.0.0.1:8000/images/coaches/' + coach.imageName : 'img/avatar-defaut.svg';
  }

  // Ajouter une fiche coach (admin) : API Platform attend du JSON-LD
  creerCoach(coach: Partial<CoachInterface>): Observable<CoachInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<CoachInterface>(this.api, coach, { headers });
  }

  // Modifier une fiche coach : seulement les champs changés (merge-patch)
  modifierCoach(id: number, coach: Partial<CoachInterface>): Observable<CoachInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<CoachInterface>(`${this.api}/${id}`, coach, { headers });
  }

  supprimerCoach(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // Photo du coach : FormData (multipart), la clé doit s'appeler imageFile comme dans Symfony
  envoyerPhoto(id: number, fichier: File): Observable<{ message: string; imageName: string }> {
    const formulaire = new FormData();
    formulaire.append('imageFile', fichier);
    return this.http.post<{ message: string; imageName: string }>(`${this.api}/${id}/image`, formulaire);
  }
}
