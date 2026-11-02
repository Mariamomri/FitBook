import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActiviteInterface } from './activite-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ActiviteService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/api/activites';

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

  // Photo d'illustration selon le nom de l'activité (photo par défaut sinon)
  photo(nom: string | undefined): string {
    const photos: Record<string, string> = {
      musculation: 'img/barbell.jpg',
      'hatha yoga': 'img/yoga.jpg',
      yoga: 'img/yoga.jpg',
      pilates: 'img/stretch.jpg',
      crossfit: 'img/crossfit.jpg',
      boxe: 'img/boxing.jpg',
      zumba: 'img/cardio.jpg',
      cardio: 'img/cardio.jpg',
    };
    // toLowerCase : "Hatha Yoga" et "Hatha yoga" donnent la même photo
    return photos[(nom ?? '').toLowerCase()] ?? 'img/gym1.jpg';
  }
}
