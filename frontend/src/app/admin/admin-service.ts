import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserInterface } from '../auth/user-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/api/users';

  // Rôles proposés dans les listes (valeur choisie + libellé affiché + rôles Symfony)
  roles = [
    { valeur: 'sportif', libelle: 'Sportif', roles: [] as string[] },
    { valeur: 'coach', libelle: 'Coach', roles: ['ROLE_COACH'] },
    { valeur: 'salle', libelle: 'Gestionnaire', roles: ['ROLE_SALLE'] },
    { valeur: 'admin', libelle: 'Admin', roles: ['ROLE_ADMIN'] },
  ];

  // Liste de tous les comptes (réservée à l'admin côté Symfony)
  getUtilisateurs(): Observable<{ member: UserInterface[] }> {
    return this.http.get<{ member: UserInterface[] }>(this.api);
  }

  // Création d'un compte par l'admin (il choisit le rôle)
  creerUtilisateur(user: UserInterface): Observable<UserInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/ld+json' });
    return this.http.post<UserInterface>(this.api, user, { headers });
  }

  // Changer le rôle ou le statut (actif / suspendu)
  modifierUtilisateur(id: number, user: Partial<UserInterface>): Observable<UserInterface> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    return this.http.patch<UserInterface>(`${this.api}/${id}`, user, { headers });
  }

  supprimerUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // Message lisible à partir d'une erreur Symfony (422 = règles de validation non respectées)
  messageErreur(err: HttpErrorResponse): string {
    const violations: { propertyPath: string; message: string }[] = err.error?.violations ?? [];
    if (violations.length > 0) {
      return violations.map((v) => v.propertyPath + ' : ' + v.message).join(' / ');
    }
    if (err.status === 403) {
      return 'Action non autorisée.';
    }
    // Doublon refusé par la base (ex. un compte qui a déjà une fiche coach)
    if (String(err.error?.detail ?? '').includes('Duplicat') || String(err.error?.detail ?? '').includes('Duplicate')) {
      return 'Cet élément existe déjà (doublon refusé par la base de données).';
    }
    if (err.status === 500) {
      return "Impossible : cet élément est encore lié à d'autres données (réservations, cours...).";
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
