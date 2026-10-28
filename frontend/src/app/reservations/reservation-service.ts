import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservationInterface } from './reservation-interface';

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
}