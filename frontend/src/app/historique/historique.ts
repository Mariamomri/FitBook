import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { SidebarSportif } from '../layout/sidebar-sportif/sidebar-sportif';
import { ReservationService } from '../reservations/reservation-service';
import { ReservationInterface } from '../reservations/reservation-interface';
import { SeanceService } from '../seances/seance-service';
import { SeanceInterface } from '../seances/seance-interface';
import { CoursService } from '../cours/cours-service';
import { CoursInterface } from '../cours/cours-interface';
import { AvisService } from '../avis/avis-service';
import { AvisInterface } from '../avis/avis-interface';
import { AdminService } from '../admin/admin-service';

// Ce que le sportif peut noter pour une séance : le cours, la salle et le coach
interface CibleAvis {
  type: 'cours' | 'salle' | 'coach';
  libelle: string;
  lien: string; // ex. "/api/cours/12"
  dejaNote: boolean;
}

@Component({
  selector: 'app-historique',
  imports: [SidebarSportif],
  templateUrl: './historique.html',
  styleUrl: './historique.css',
})
export class Historique implements OnInit {
  private reservationService = inject(ReservationService);
  private seanceService = inject(SeanceService);
  private coursService = inject(CoursService);
  avisService = inject(AvisService);
  private adminService = inject(AdminService);

  seances = signal<SeanceInterface[]>([]);
  cours = signal<CoursInterface[]>([]);
  avis = signal<AvisInterface[]>([]);
  succes = signal('');

  // Fenêtre « Laisser un avis » : la réservation, les cibles possibles, le choix et la note
  reservationNotee = signal<ReservationInterface | null>(null);
  cibles = signal<CibleAvis[]>([]);
  cibleChoisie = signal<CibleAvis | null>(null);
  note = signal(5);
  erreurAvis = signal('');
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
    this.seanceService.getSeances().subscribe((reponse) => this.seances.set(reponse.member));
    this.coursService.getCours().subscribe((reponse) => this.cours.set(reponse.member));
    this.avisService.getAvis().subscribe((reponse) => this.avis.set(reponse.member));
  }

  date(reservation: ReservationInterface): Date {
    return this.reservationService.versDate(reservation.dateDebut);
  }

  // Une séance passée non annulée = effectuée
  statutAffiche(reservation: ReservationInterface): string {
    return reservation.statut === 'annulee' ? 'annulee' : 'effectuee';
  }

  // Nombre d'avis déjà laissés sur une réservation
  nombreAvis(reservation: ReservationInterface): number {
    return this.avis().filter((a) => a.reservation === '/api/reservations/' + reservation.id).length;
  }

  // Ouvre la fenêtre : on retrouve la séance, puis le cours, la salle et le coach à noter
  ouvrirAvis(reservation: ReservationInterface): void {
    this.erreurAvis.set('');
    this.succes.set('');
    this.note.set(5);
    this.reservationService.getUneReservation(reservation.id!).subscribe((detail) => {
      const seance = this.seances().find((s) => '/api/seances/' + s.id === detail.seance);
      const cours = this.cours().find((c) => c.id === seance?.coursId);
      if (!cours) {
        return;
      }
      // Une seule note par cible et par réservation
      const dejaNotes = this.avis().filter((a) => a.reservation === '/api/reservations/' + reservation.id);
      const liste: CibleAvis[] = [
        { type: 'cours', libelle: 'Le cours · ' + cours.titre, lien: '/api/cours/' + cours.id, dejaNote: false },
        { type: 'salle', libelle: 'La salle · ' + cours.salleNom, lien: cours.salle ?? '', dejaNote: false },
      ];
      if (cours.coach) {
        liste.push({ type: 'coach', libelle: 'Le coach · ' + cours.coachNom, lien: cours.coach, dejaNote: false });
      }
      liste.forEach((cible) => (cible.dejaNote = dejaNotes.some((a) => a[cible.type] === cible.lien)));

      this.cibles.set(liste);
      this.cibleChoisie.set(liste.find((c) => !c.dejaNote) ?? null);
      this.reservationNotee.set(reservation);
    });
  }

  envoyerAvis(commentaire: string): void {
    const reservation = this.reservationNotee();
    const cible = this.cibleChoisie();
    if (!reservation || !cible) {
      return;
    }
    if (commentaire.trim().length < 3) {
      this.erreurAvis.set('Écrivez un commentaire (au moins 3 caractères).');
      return;
    }

    // Nouvel avis « en attente » : l'admin le publie après modération
    const avis: AvisInterface = {
      note: this.note(),
      commentaire: commentaire.trim(),
      statut: 'en_attente',
      reservation: '/api/reservations/' + reservation.id,
      [cible.type]: cible.lien,
    };

    this.avisService.creerAvis(avis).subscribe({
      next: (nouveau) => {
        this.avis.update((liste) => [...liste, { ...avis, id: nouveau.id }]);
        this.reservationNotee.set(null);
        this.succes.set('Merci ! Votre avis sera visible après validation.');
      },
      // 403 : email non confirmé ou réservation d'un autre / 422 : données invalides
      error: (err) => this.erreurAvis.set(err.error?.detail ?? this.adminService.messageErreur(err)),
    });
  }
}
