import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoursInterface } from './cours-interface';
import { environment } from '../../environments/environment';
import { ActiviteService } from '../activites/activite-service';
import { photoDuCours } from './cours-photos';

@Injectable({
  providedIn: 'root',
})
export class CoursService {
  private http = inject(HttpClient);
  private activiteService = inject(ActiviteService);
  private api = environment.apiUrl + '/api/cours';

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

  // Photo du cours : celle envoyée par le coach, sinon celle choisie pour ce cours, sinon la photo de son activité
  photo(imageName: string | null | undefined, activiteNom: string | undefined, titre?: string): string {
    if (imageName) {
      return environment.apiUrl + '/images/cours/' + imageName;
    }
    return photoDuCours(titre) ?? this.activiteService.photo(activiteNom);
  }

  // Envoi d'une nouvelle photo pour le cours (coach du cours, gestionnaire ou admin)
  envoyerPhoto(id: number, fichier: File): Observable<{ message: string; imageName: string }> {
    const formulaire = new FormData();
    formulaire.append('imageFile', fichier);
    return this.http.post<{ message: string; imageName: string }>(`${this.api}/${id}/image`, formulaire);
  }
}
