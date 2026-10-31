import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SeanceService } from '../seances/seance-service';
import { SeanceInterface } from '../seances/seance-interface';
import { SalleService } from '../salles/salle-service';
import { SalleInterface } from '../salles/salle-interface';
import { AuthService } from '../auth/auth-service';
import { ActiviteService } from '../activites/activite-service';
import { AvisService } from '../avis/avis-service';
import { AvisInterface } from '../avis/avis-interface';
import { CoursService } from '../cours/cours-service';
import { CoursInterface } from '../cours/cours-interface';

@Component({
  selector: 'app-accueil',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export class Accueil implements OnInit {
  private seanceService = inject(SeanceService);
  salleService = inject(SalleService);
  private router = inject(Router);
  authService = inject(AuthService);
  activiteService = inject(ActiviteService);
  avisService = inject(AvisService);
  private coursService = inject(CoursService);

  seances = signal<SeanceInterface[]>([]);
  salles = signal<SalleInterface[]>([]);
  avis = signal<AvisInterface[]>([]);
  cours = signal<CoursInterface[]>([]);

  // Barre de recherche du bandeau
  rechercheForm = new FormGroup({
    quoi: new FormControl(''),
    ou: new FormControl(''),
    quand: new FormControl(''),
  });

  // Les 4 prochaines séances ouvertes (« Activités à venir »)
  prochainesSeances = computed(() => this.seances().filter((s) => s.statut === 'ouverte').slice(0, 4));

  // Une grande salle + deux petites (« Salles populaires »)
  salleVedette = computed(() => this.salles()[0]);
  autresSalles = computed(() => this.salles().slice(1, 3));

  // Les 3 derniers avis publiés (« Ce que disent nos sportifs »)
  derniersAvis = computed(() =>
    this.avis()
      .filter((a) => a.statut === 'publie')
      .slice(-3)
      .reverse(),
  );

  // Bande défilante
  activitesDefilantes = ['Musculation', 'Boxe', 'Yoga', 'CrossFit', 'Cardio', 'Pilates', 'HIIT', 'Zumba'];

  ngOnInit(): void {
    this.seanceService.getSeances().subscribe((reponse) => this.seances.set(reponse.member));
    this.salleService.getSalles().subscribe((reponse) => this.salles.set(reponse.member));
    this.avisService.getAvis().subscribe((reponse) => this.avis.set(reponse.member));
    this.coursService.getCours().subscribe((reponse) => this.cours.set(reponse.member));
  }

  // Note moyenne d'une salle (avis publiés), 0 si aucun avis
  noteSalle(salle: SalleInterface): number {
    const liste = this.avis().filter((a) => a.statut === 'publie' && a.salle === '/api/salles/' + salle.id);
    return liste.length === 0 ? 0 : Math.round((liste.reduce((s, a) => s + a.note, 0) / liste.length) * 10) / 10;
  }

  nombreAvisSalle(salle: SalleInterface): number {
    return this.avis().filter((a) => a.statut === 'publie' && a.salle === '/api/salles/' + salle.id).length;
  }

  // Sur quoi porte l'avis : nom de la salle, titre du cours ou "Coach"
  sujetAvis(unAvis: AvisInterface): string {
    if (unAvis.salle) {
      return this.salles().find((s) => '/api/salles/' + s.id === unAvis.salle)?.nom ?? 'Salle';
    }
    if (unAvis.cours) {
      return this.cours().find((c) => '/api/cours/' + c.id === unAvis.cours)?.titre ?? 'Cours';
    }
    return 'Coach';
  }

  // Envoie la recherche vers la page Activités (les filtres sont dans l'URL)
  rechercher(): void {
    const { quoi, ou, quand } = this.rechercheForm.value;
    this.router.navigate(['/activites'], {
      queryParams: { quoi: quoi || null, ou: ou || null, quand: quand || null },
    });
  }
}
