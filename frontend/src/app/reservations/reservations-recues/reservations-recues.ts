import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReservationService } from '../reservation-service';
import { ReservationRecueInterface } from '../reservation-interface';

@Component({
  selector: 'app-reservations-recues',
  imports: [DatePipe],
  templateUrl: './reservations-recues.html',
  styleUrls: ['../../admin/admin-commun.css', './reservations-recues.css'],
})
export class ReservationsRecues implements OnInit {
  private reservationService = inject(ReservationService);

  // 'salle' : réservations des salles du gestionnaire / 'coach' : réservations des cours du coach
  pour = input.required<'salle' | 'coach'>();

  reservations = signal<ReservationRecueInterface[]>([]);
  recherche = signal('');
  periode = signal('a-venir');
  erreur = signal('');

  // Filtre : période (à venir / passées / toutes) + recherche sur le sportif ou le cours
  reservationsFiltrees = computed(() => {
    const maintenant = new Date().toISOString();
    const texte = this.recherche().toLowerCase();
    return this.reservations()
      .filter((r) => this.periode() === 'toutes' || (this.periode() === 'a-venir' ? r.dateDebut >= maintenant : r.dateDebut < maintenant))
      .filter((r) => r.sportif.toLowerCase().includes(texte) || r.cours.toLowerCase().includes(texte));
  });

  // Nombre de réservations confirmées à venir (affiché dans le titre)
  confirmeesAVenir = computed(
    () => this.reservations().filter((r) => r.statut === 'confirmee' && r.dateDebut >= new Date().toISOString()).length,
  );

  ngOnInit(): void {
    const demande =
      this.pour() === 'salle'
        ? this.reservationService.getReservationsDeMesSalles()
        : this.reservationService.getReservationsDeMesCours();

    demande.subscribe({
      next: (reponse) => this.reservations.set(reponse),
      error: () => this.erreur.set('Impossible de charger les réservations.'),
    });
  }
}
