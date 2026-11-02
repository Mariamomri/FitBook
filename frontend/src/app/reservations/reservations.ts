import { Component, OnInit, inject, signal } from '@angular/core';
import { ReservationService } from './reservation-service';
import { ReservationInterface } from './reservation-interface';
import { RouterLink } from '@angular/router';
import { SidebarSportif } from '../layout/sidebar-sportif/sidebar-sportif';

@Component({
  selector: 'app-reservations',
  imports: [RouterLink, SidebarSportif],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations implements OnInit {
  private reservationService = inject(ReservationService);
  reservations = signal<ReservationInterface[]>([]);
  erreur = signal('');
  succes = signal('');
  // Fenêtre du QR code : numéro de la réservation et image (null = fermée)
  qrOuvert = signal<{ numero: string; image: string } | null>(null);

  // Au chargement de la page, on récupère les réservations de l'utilisateur connecté
  ngOnInit(): void {
    this.reservationService.getMesReservations().subscribe({
      next: (reponse) => this.reservations.set(reponse),
      error: () => this.erreur.set('Impossible de charger vos réservations'),
    });
  }

  // Annule la réservation puis met à jour son statut dans la liste (sans recharger la page)
  annuler(reservation: ReservationInterface): void {
    this.erreur.set('');
    this.succes.set('');

    this.reservationService.annuler(reservation.id!).subscribe({
      next: (reponse) => {
        this.reservations.update((liste) =>
          liste.map((element) => (element.id === reservation.id ? { ...element, statut: reponse.statut } : element)),
        );
        this.succes.set(reponse.message);
      },
      // 403 ou 422 : Symfony renvoie le message à afficher (déjà annulée, séance commencée...)
      error: (err) => this.erreur.set(err.error?.message ?? 'Impossible d\'annuler cette réservation'),
    });
  }

  // Bouton « QR » : on dessine le QR code puis on ouvre la fenêtre
  afficherQr(reservation: ReservationInterface): void {
    this.reservationService.qrCode(reservation.numero).then((image) => this.qrOuvert.set({ numero: reservation.numero, image }));
  }
}
