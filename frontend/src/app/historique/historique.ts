import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { SidebarSportif } from '../layout/sidebar-sportif/sidebar-sportif';
import { ReservationService } from '../reservations/reservation-service';
import { ReservationInterface } from '../reservations/reservation-interface';

@Component({
  selector: 'app-historique',
  imports: [SidebarSportif],
  templateUrl: './historique.html',
  styleUrl: './historique.css',
})
export class Historique implements OnInit {
  private reservationService = inject(ReservationService);
  reservations = signal<ReservationInterface[]>([]);
  erreur = signal('');

  // Filtres
  recherche = signal('');
  statut = signal('tous');

  // Séances déjà passées, la plus récente en premier, puis filtrées
  seancesPassees = computed(() => {
    const texte = this.recherche().toLowerCase();
    return this.reservations()
      .filter((r) => this.date(r) <= new Date())
      .filter((r) => r.cours.toLowerCase().includes(texte) || r.salle.toLowerCase().includes(texte))
      .filter((r) => this.statut() === 'tous' || this.statutAffiche(r) === this.statut())
      .sort((a, b) => this.date(b).getTime() - this.date(a).getTime());
  });

  ngOnInit(): void {
    this.reservationService.getMesReservations().subscribe({
      next: (reponse) => this.reservations.set(reponse),
      error: () => this.erreur.set('Impossible de charger votre historique'),
    });
  }

  date(reservation: ReservationInterface): Date {
    return this.reservationService.versDate(reservation.dateDebut);
  }

  // Une séance passée non annulée = effectuée
  statutAffiche(reservation: ReservationInterface): string {
    return reservation.statut === 'annulee' ? 'annulee' : 'effectuee';
  }
}
