import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserInterface } from '../auth/user-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfilService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/api';

  // Dossier public où Symfony range les photos de profil
  dossierPhotos = environment.apiUrl + '/images/users/';

  // PATCH : on n'envoie que les champs modifiés (format merge-patch d'API Platform)
  modifier(id: number, donnees: Partial<UserInterface>): Observable<UserInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<UserInterface>(this.api + '/users/' + id, donnees, { headers });
  }

  // Envoi d'un fichier : FormData (multipart), la clé doit s'appeler imageFile comme dans Symfony
  envoyerPhoto(fichier: File): Observable<{ message: string; imageName: string }> {
    const formulaire = new FormData();
    formulaire.append('imageFile', fichier);
    return this.http.post<{ message: string; imageName: string }>(this.api + '/me/image', formulaire);
  }

  // Adresse de la photo, ou image par défaut si l'utilisateur n'en a pas encore
  photo(imageName?: string | null): string {
    return imageName ? this.dossierPhotos + imageName : 'img/avatar-defaut.svg';
  }

  // Rôle affiché sous le nom
  libelleRole(roles: string[] = []): string {
    if (roles.includes('ROLE_ADMIN')) return 'Admin';
    if (roles.includes('ROLE_COACH')) return 'Coach';
    if (roles.includes('ROLE_SALLE')) return 'Gestionnaire';
    return 'Sportif';
  }
}
