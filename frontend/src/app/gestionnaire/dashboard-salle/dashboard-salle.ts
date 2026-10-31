import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/auth-service';
import { UserInterface } from '../../auth/user-interface';
import { SalleService } from '../../salles/salle-service';
import { SalleInterface } from '../../salles/salle-interface';
import { CoursService } from '../../cours/cours-service';
import { CoursInterface } from '../../cours/cours-interface';
import { AvisService } from '../../avis/avis-service';
import { AvisInterface } from '../../avis/avis-interface';
import { SidebarSportif } from '../../layout/sidebar-sportif/sidebar-sportif';
import { GestionSalles } from '../gestion-salles/gestion-salles';
import { GestionCours } from '../gestion-cours/gestion-cours';
import { GestionHoraires } from '../gestion-horaires/gestion-horaires';
import { GestionSeances } from '../gestion-seances/gestion-seances';
import { OngletActivites } from '../../admin/onglet-activites/onglet-activites';
import { ReservationsRecues } from '../../reservations/reservations-recues/reservations-recues';

@Component({
  selector: 'app-dashboard-salle',
  imports: [SidebarSportif, GestionSalles, GestionCours, GestionHoraires, GestionSeances, OngletActivites, ReservationsRecues],
  templateUrl: './dashboard-salle.html',
  styleUrl: './dashboard-salle.css',
})
export class DashboardSalle implements OnInit {
  private authService = inject(AuthService);
  private salleService = inject(SalleService);
  private coursService = inject(CoursService);
  private avisService = inject(AvisService);

  moi = signal<UserInterface | null>(null);
  salles = signal<SalleInterface[]>([]);
  cours = signal<CoursInterface[]>([]);
  avis = signal<AvisInterface[]>([]);

  // Ses salles (liens "/api/salles/12"), ses cours et les avis publiés sur ses salles
  liensMesSalles = computed(() =>
    this.salles()
      .filter((s) => s.gestionnaire === '/api/users/' + this.moi()?.id)
      .map((s) => '/api/salles/' + s.id),
  );
  mesCours = computed(() => this.cours().filter((c) => this.liensMesSalles().includes(c.salle ?? '')));
  avisMesSalles = computed(() =>
    this.avis().filter((a) => a.statut === 'publie' && this.liensMesSalles().includes(a.salle ?? '')),
  );

  // Moyenne des notes, arrondie à 0,1 (0 s'il n'y a pas encore d'avis)
  noteMoyenne = computed(() => {
    const liste = this.avisMesSalles();
    if (liste.length === 0) {
      return 0;
    }
    const total = liste.reduce((somme, a) => somme + a.note, 0);
    return Math.round((total / liste.length) * 10) / 10;
  });

  ngOnInit(): void {
    this.authService.getMoi().subscribe((reponse) => this.moi.set(reponse));
    this.salleService.getSalles().subscribe((reponse) => this.salles.set(reponse.member));
    this.coursService.getCours().subscribe((reponse) => this.cours.set(reponse.member));
    this.avisService.getAvis().subscribe((reponse) => this.avis.set(reponse.member));
  }

  nomSalle(lien?: string | null): string {
    return this.salles().find((s) => '/api/salles/' + s.id === lien)?.nom ?? '';
  }

  etoiles(note: number): string {
    return '★'.repeat(note) + '☆'.repeat(5 - note);
  }
}
