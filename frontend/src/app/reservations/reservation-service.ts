import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import QRCode from 'qrcode'; // bibliothèque qui dessine un QR code
import { ReservationInterface, ReservationAdminInterface, ReservationRecueInterface } from './reservation-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/api/me/reservations';

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
    return this.http.get<{ member: ReservationAdminInterface[] }>(environment.apiUrl + '/api/reservations');
  }

  supprimerReservation(id: number): Observable<void> {
    return this.http.delete<void>(environment.apiUrl + '/api/reservations/' + id);
  }

  // QR code de la réservation (image en base64) : l'accueil de la salle le scanne pour lire le numéro
  qrCode(numero: string): Promise<string> {
    return QRCode.toDataURL('FITBOOK-RESERVATION:' + numero, {
      width: 220,
      margin: 1,
      color: { dark: '#080809', light: '#ffffff' },
    });
  }

  // Réservations des salles du gestionnaire connecté
  getReservationsDeMesSalles(): Observable<ReservationRecueInterface[]> {
    return this.http.get<ReservationRecueInterface[]>(environment.apiUrl + '/api/me/salle/reservations');
  }

  // Réservations des cours du coach connecté
  getReservationsDeMesCours(): Observable<ReservationRecueInterface[]> {
    return this.http.get<ReservationRecueInterface[]>(environment.apiUrl + '/api/me/coach/reservations');
  }

  // Une réservation par son id (le propriétaire y a accès) : donne le lien vers la séance
  getUneReservation(id: number): Observable<ReservationAdminInterface> {
    return this.http.get<ReservationAdminInterface>(environment.apiUrl + '/api/reservations/' + id);
  }
}
