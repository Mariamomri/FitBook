import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../admin-service';
import { UserInterface } from '../../auth/user-interface';
import { SeanceInterface } from '../../seances/seance-interface';

// Réservation telle que renvoyée par API Platform : user et seance sont des liens ("/api/users/12")
interface ReservationAdmin {
  id: number;
  numero: string;
  statut: string;
  user: string;
  seance: string;
}

@Component({
  selector: 'app-onglet-reservations',
  imports: [DatePipe],
  templateUrl: './onglet-reservations.html',
  styleUrl: '../admin-commun.css',
})
export class OngletReservations implements OnInit {
  adminService = inject(AdminService);

  reservations = signal<ReservationAdmin[]>([]);
  utilisateurs = signal<UserInterface[]>([]);
  seances = signal<SeanceInterface[]>([]);
  erreur = signal('');
  succes = signal('');
  statutFiltre = signal('tous');
  aSupprimer = signal<ReservationAdmin | null>(null);

  // Plus récentes en premier
  reservationsFiltrees = computed(() =>
    this.reservations()
      .filter((r) => this.statutFiltre() === 'tous' || r.statut === this.statutFiltre())
      .sort((a, b) => b.id - a.id),
  );

  ngOnInit(): void {
    this.adminService.liste<ReservationAdmin>('reservations').subscribe({
      next: (reponse) => this.reservations.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
    // Pour afficher des noms à la place des liens
    this.adminService.liste<UserInterface>('users').subscribe((reponse) => this.utilisateurs.set(reponse.member));
    this.adminService.liste<SeanceInterface>('seances').subscribe((reponse) => this.seances.set(reponse.member));
  }

  sportif(iri: string): string {
    const user = this.utilisateurs().find((u) => u.id === this.adminService.idDepuisIri(iri));
    return user ? user.firstname + ' ' + user.lastname : '—';
  }

  seance(iri: string): SeanceInterface | undefined {
    return this.seances().find((s) => s.id === this.adminService.idDepuisIri(iri));
  }

  confirmerSuppression(): void {
    const reservation = this.aSupprimer();
    if (!reservation) {
      return;
    }
    this.adminService.supprimer('reservations', reservation.id).subscribe({
      next: () => {
        this.reservations.update((liste) => liste.filter((r) => r.id !== reservation.id));
        this.succes.set('Réservation ' + reservation.numero + ' supprimée.');
        this.aSupprimer.set(null);
      },
      error: (err) => {
        this.erreur.set(this.adminService.messageErreur(err));
        this.aSupprimer.set(null);
      },
    });
  }
}
