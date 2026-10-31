import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth-service';
import { UserInterface } from '../auth/user-interface';
import { ReservationService } from '../reservations/reservation-service';
import { ReservationInterface } from '../reservations/reservation-interface';
import { SidebarSportif } from '../layout/sidebar-sportif/sidebar-sportif';
import { Calendrier } from '../calendrier/calendrier';
import { DashboardAdmin } from '../admin/dashboard-admin/dashboard-admin';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, SidebarSportif, Calendrier, DashboardAdmin],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);

  moi = signal<UserInterface | null>(null);
  reservations = signal<ReservationInterface[]>([]);
  erreur = signal('');
  succes = signal('');

  // Réservations confirmées dont la séance n'a pas encore eu lieu (la plus proche en premier)
  aVenir = computed(() =>
    this.reservations()
      .filter((r) => r.statut !== 'annulee' && this.estFuture(r))
      .sort((a, b) => this.date(a).getTime() - this.date(b).getTime()),
  );

  // Séances confirmées déjà passées
  effectuees = computed(() => this.reservations().filter((r) => r.statut !== 'annulee' && !this.estFuture(r)));

  annulees = computed(() => this.reservations().filter((r) => r.statut === 'annulee'));

  // L'admin a sa propre dashboard (gestion des comptes, salles, coachs)
  estAdmin = computed(() => this.moi()?.roles?.includes('ROLE_ADMIN') ?? false);

  ngOnInit(): void {
    this.authService.getMoi().subscribe((reponse) => this.moi.set(reponse));
    this.reservationService.getMesReservations().subscribe({
      next: (reponse) => this.reservations.set(reponse),
      error: () => this.erreur.set('Impossible de charger vos réservations'),
    });
  }

  date(reservation: ReservationInterface): Date {
    return this.reservationService.versDate(reservation.dateDebut);
  }

  estFuture(reservation: ReservationInterface): boolean {
    return this.date(reservation) > new Date();
  }

  // Annule puis met à jour le statut dans la liste (sans recharger la page)
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
      error: (err) => this.erreur.set(err.error?.message ?? "Impossible d'annuler cette réservation"),
    });
  }
}
