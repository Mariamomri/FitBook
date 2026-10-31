import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservationInterface, ReservationAdminInterface } from './reservation-interface';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/me/reservations';

  // Réservations de l'utilisateur connecté (le token est ajouté par l'intercepteur)
  getMesReservations(): Observable<ReservationInterface[]> {
    return this.http.get<ReservationInterface[]>(this.api);
  }

  // "30/10/2026 18:00" (format envoyé par Symfony) → objet Date, pour comparer avec maintenant
  versDate(texte: string): Date {
    const [date, heure] = texte.split(' ');
    const [jour, mois, annee] = date.split('/').map(Number);
    const [heures, minutes] = heure.split(':').map(Number);
    return new Date(annee, mois - 1, jour, heures, minutes);
  }

  // Annule une de mes réservations : Symfony passe le statut à annulee
  annuler(id: number): Observable<{ message: string; statut: string }> {
    return this.http.patch<{ message: string; statut: string }>(this.api + '/' + id + '/annuler', {});
  }

  // Toutes les réservations (admin) : user et seance sont des liens ("/api/users/12")
  getToutesLesReservations(): Observable<{ member: ReservationAdminInterface[] }> {
    return this.http.get<{ member: ReservationAdminInterface[] }>('https://127.0.0.1:8000/api/reservations');
  }

  supprimerReservation(id: number): Observable<void> {
    return this.http.delete<void>('https://127.0.0.1:8000/api/reservations/' + id);
  }
}
