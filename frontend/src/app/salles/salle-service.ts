import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalleInterface } from './salle-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SalleService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/api/salles';

  // API Platform renvoie la liste dans "member"
  getSalles(): Observable<{ member: SalleInterface[] }> {
    return this.http.get<{ member: SalleInterface[] }>(this.api);
  }

  // Une salle par son id (fiche de la salle)
  getUneSalle(id: number): Observable<SalleInterface> {
    return this.http.get<SalleInterface>(`${this.api}/${id}`);
  }

  // Photo envoyée par le gestionnaire, ou image par défaut si la salle n'en a pas
  photo(salle: SalleInterface): string {
    return salle.imageName ? environment.apiUrl + '/images/salles/' + salle.imageName : 'img/gym1.jpg';
  }

  // Ajouter une salle (admin ou gestionnaire) : API Platform attend du JSON-LD
  creerSalle(salle: SalleInterface): Observable<SalleInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<SalleInterface>(this.api, salle, { headers });
  }

  // Modifier une salle : on envoie seulement les champs changés (merge-patch)
  modifierSalle(id: number, salle: Partial<SalleInterface>): Observable<SalleInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<SalleInterface>(`${this.api}/${id}`, salle, { headers });
  }

  supprimerSalle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // Photo de la salle : FormData (multipart), la clé doit s'appeler imageFile comme dans Symfony
  envoyerPhoto(id: number, fichier: File): Observable<{ message: string; imageName: string }> {
    const formulaire = new FormData();
    formulaire.append('imageFile', fichier);
    return this.http.post<{ message: string; imageName: string }>(`${this.api}/${id}/image`, formulaire);
  }
}
