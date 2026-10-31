import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/auth-service';
import { UserInterface } from '../../auth/user-interface';
import { CoachService } from '../../coach/coach-service';
import { CoachInterface } from '../../coach/coach-interface';
import { SeanceService } from '../../seances/seance-service';
import { SeanceInterface } from '../../seances/seance-interface';
import { CoursService } from '../../cours/cours-service';
import { CoursInterface } from '../../cours/cours-interface';
import { AvisService } from '../../avis/avis-service';
import { AvisInterface } from '../../avis/avis-interface';
import { SidebarSportif } from '../../layout/sidebar-sportif/sidebar-sportif';
import { ProfilPro } from '../profil-pro/profil-pro';
import { GestionDisponibilites } from '../gestion-disponibilites/gestion-disponibilites';
import { GestionSeances } from '../../gestionnaire/gestion-seances/gestion-seances';
import { ReservationsRecues } from '../../reservations/reservations-recues/reservations-recues';

@Component({
  selector: 'app-dashboard-coach',
  imports: [SidebarSportif, ProfilPro, GestionDisponibilites, GestionSeances, ReservationsRecues],
  templateUrl: './dashboard-coach.html',
  styleUrl: './dashboard-coach.css',
})
export class DashboardCoach implements OnInit {
  private authService = inject(AuthService);
  private coachService = inject(CoachService);
  private seanceService = inject(SeanceService);
  private coursService = inject(CoursService);
  private avisService = inject(AvisService);

  moi = signal<UserInterface | null>(null);
  coaches = signal<CoachInterface[]>([]);
  seances = signal<SeanceInterface[]>([]);
  cours = signal<CoursInterface[]>([]);
  avis = signal<AvisInterface[]>([]);
  charge = signal(false);

  // Sa fiche coach : celle qui est liée à son compte
  maFiche = computed(() => this.coaches().find((c) => c.user === '/api/users/' + this.moi()?.id));
  lienFiche = computed(() => (this.maFiche() ? '/api/coaches/' + this.maFiche()!.id : ''));

  // Ses séances à venir (cours qu'il anime, séances ouvertes)
  seancesAVenir = computed(() => {
    const ids = this.cours()
      .filter((c) => c.coach === this.lienFiche())
      .map((c) => c.id);
    return this.seances().filter((s) => ids.includes(s.coursId) && s.statut === 'ouverte');
  });
  placesRestantes = computed(() => this.seancesAVenir().reduce((total, s) => total + s.placesRestantes, 0));

  // Avis publiés sur lui
  mesAvis = computed(() => this.avis().filter((a) => a.statut === 'publie' && a.coach === this.lienFiche()));
  noteMoyenne = computed(() => {
    const liste = this.mesAvis();
    if (liste.length === 0) {
      return 0;
    }
    return Math.round((liste.reduce((somme, a) => somme + a.note, 0) / liste.length) * 10) / 10;
  });

  ngOnInit(): void {
    this.authService.getMoi().subscribe((reponse) => this.moi.set(reponse));
    this.coachService.getCoaches().subscribe((reponse) => {
      this.coaches.set(reponse.member);
      this.charge.set(true);
    });
    this.seanceService.getSeances().subscribe((reponse) => this.seances.set(reponse.member));
    this.coursService.getCours().subscribe((reponse) => this.cours.set(reponse.member));
    this.avisService.getAvis().subscribe((reponse) => this.avis.set(reponse.member));
  }

  etoiles(note: number): string {
    return '★'.repeat(note) + '☆'.repeat(5 - note);
  }
}
