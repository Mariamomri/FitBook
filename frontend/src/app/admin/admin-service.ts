import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserInterface } from '../auth/user-interface';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  api = 'https://127.0.0.1:8000/api';

  // Rôles proposés dans les listes (valeur choisie + libellé affiché + rôles Symfony)
  roles = [
    { valeur: 'sportif', libelle: 'Sportif', roles: [] as string[] },
    { valeur: 'coach', libelle: 'Coach', roles: ['ROLE_COACH'] },
    { valeur: 'salle', libelle: 'Gestionnaire', roles: ['ROLE_SALLE'] },
    { valeur: 'admin', libelle: 'Admin', roles: ['ROLE_ADMIN'] },
  ];

  // CRUD générique sur une ressource API Platform (users, salles, coaches, activites...)
  liste<T>(ressource: string): Observable<{ member: T[]; totalItems: number }> {
    return this.http.get<{ member: T[]; totalItems: number }>(this.api + '/' + ressource);
  }

  creer<T>(ressource: string, donnees: object): Observable<T> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<T>(this.api + '/' + ressource, donnees, { headers });
  }

  // PATCH : seulement les champs modifiés (format merge-patch d'API Platform)
  modifier<T>(ressource: string, id: number, donnees: object): Observable<T> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<T>(this.api + '/' + ressource + '/' + id, donnees, { headers });
  }

  supprimer(ressource: string, id: number): Observable<void> {
    return this.http.delete<void>(this.api + '/' + ressource + '/' + id);
  }

  // Message lisible à partir d'une erreur Symfony (422 = règles de validation non respectées)
  messageErreur(err: HttpErrorResponse): string {
    const violations: { propertyPath: string; message: string }[] = err.error?.violations ?? [];
    if (violations.length > 0) {
      return violations.map((v) => v.propertyPath + ' : ' + v.message).join(' / ');
    }
    if (err.status === 403) {
      return "Action non autorisée.";
    }
    if (err.status === 500) {
      return 'Impossible : cet élément est encore lié à d\'autres données (réservations, cours...).';
    }
    return err.error?.detail ?? 'Erreur serveur';
  }

  // "/api/users/12" → 12 (API Platform renvoie les liens entre entités sous forme d'adresse)
  idDepuisIri(iri?: string | null): number | null {
    return iri ? Number(iri.split('/').pop()) : null;
  }

  // ["ROLE_COACH"] → "coach" (le rôle le plus fort gagne)
  roleDe(user: UserInterface): string {
    const roles = user.roles ?? [];
    if (roles.includes('ROLE_ADMIN')) return 'admin';
    if (roles.includes('ROLE_COACH')) return 'coach';
    if (roles.includes('ROLE_SALLE')) return 'salle';
    return 'sportif';
  }

  libelleRole(valeur: string): string {
    return this.roles.find((r) => r.valeur === valeur)?.libelle ?? 'Sportif';
  }

  rolesSymfony(valeur: string): string[] {
    return this.roles.find((r) => r.valeur === valeur)?.roles ?? [];
  }
}
