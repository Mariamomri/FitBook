import { Component, OnInit, inject, signal } from '@angular/core';
import { ReservationService } from './reservation-service';
import { ReservationInterface } from './reservation-interface';

@Component({
  selector: 'app-reservations',
  imports: [],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations implements OnInit {
  private reservationService = inject(ReservationService);
  reservations = signal<ReservationInterface[]>([]);
  erreur = signal('');

  // Au chargement de la page, on récupère les réservations de l'utilisateur connecté
  ngOnInit(): void {
    this.reservationService.getMesReservations().subscribe({
      next: (reponse) => this.reservations.set(reponse),
      error: () => this.erreur.set('Impossible de charger vos réservations'),
    });
  }
}
