import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AvisService } from '../avis-service';
import { AvisInterface } from '../avis-interface';
import { ReservationService } from '../../reservations/reservation-service';
import { SalleService } from '../../salles/salle-service';
import { SalleInterface } from '../../salles/salle-interface';
import { CoachService } from '../../coach/coach-service';
import { CoachInterface } from '../../coach/coach-interface';
import { CoursService } from '../../cours/cours-service';
import { CoursInterface } from '../../cours/cours-interface';
import { AdminService } from '../../admin/admin-service';
import { SidebarSportif } from '../../layout/sidebar-sportif/sidebar-sportif';

@Component({
  selector: 'app-mes-avis',
  imports: [SidebarSportif],
  templateUrl: './mes-avis.html',
  styleUrl: './mes-avis.css',
})
export class MesAvis implements OnInit {
  avisService = inject(AvisService);
  private reservationService = inject(ReservationService);
  private salleService = inject(SalleService);
  private coachService = inject(CoachService);
  private coursService = inject(CoursService);
  private adminService = inject(AdminService);

  avis = signal<AvisInterface[]>([]);
  liensMesReservations = signal<string[]>([]);
  salles = signal<SalleInterface[]>([]);
  coaches = signal<CoachInterface[]>([]);
  cours = signal<CoursInterface[]>([]);
  erreur = signal('');
  succes = signal('');

  // Avis en cours de modification + nouvelle note choisie
  idEnModification = signal<number | null>(null);
  nouvelleNote = signal(5);

  // Ses avis = ceux liés à une de ses réservations
  mesAvis = computed(() => this.avis().filter((a) => this.liensMesReservations().includes(a.reservation)));

  ngOnInit(): void {
    this.reservationService.getMesReservations().subscribe((reponse) =>
      this.liensMesReservations.set(reponse.map((r) => '/api/reservations/' + r.id)),
    );
    this.avisService.getAvis().subscribe((reponse) => this.avis.set(reponse.member));
    this.salleService.getSalles().subscribe((reponse) => this.salles.set(reponse.member));
    this.coachService.getCoaches().subscribe((reponse) => this.coaches.set(reponse.member));
    this.coursService.getCours().subscribe((reponse) => this.cours.set(reponse.member));
  }

  // "Salle · FitBook Liège", "Coach · Lucas Dubois" ou "Cours · Yoga du soir"
  cible(avis: AvisInterface): string {
    if (avis.salle) return 'Salle · ' + (this.salles().find((s) => '/api/salles/' + s.id === avis.salle)?.nom ?? '');
    if (avis.coach) return 'Coach · ' + (this.coaches().find((c) => '/api/coaches/' + c.id === avis.coach)?.nomComplet ?? '');
    if (avis.cours) return 'Cours · ' + (this.cours().find((c) => '/api/cours/' + c.id === avis.cours)?.titre ?? '');
    return '';
  }

  commencerModification(avis: AvisInterface): void {
    this.idEnModification.set(avis.id!);
    this.nouvelleNote.set(avis.note);
  }

  enregistrer(avis: AvisInterface, commentaire: string): void {
    this.erreur.set('');
    this.succes.set('');
    if (commentaire.trim().length < 3) {
      this.erreur.set('Le commentaire doit contenir au moins 3 caractères.');
      return;
    }
    const donnees = { note: this.nouvelleNote(), commentaire: commentaire.trim() };
    this.avisService.modifierAvis(avis.id!, donnees).subscribe({
      next: () => {
        this.avis.update((liste) => liste.map((a) => (a.id === avis.id ? { ...a, ...donnees } : a)));
        this.idEnModification.set(null);
        this.succes.set('Avis modifié.');
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  supprimer(avis: AvisInterface): void {
    this.avisService.supprimerAvis(avis.id!).subscribe({
      next: () => {
        this.avis.update((liste) => liste.filter((a) => a.id !== avis.id));
        this.succes.set('Avis supprimé.');
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }
}
