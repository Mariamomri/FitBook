import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CoachService } from '../coach-service';
import { CoachInterface } from '../coach-interface';
import { CoursService } from '../../cours/cours-service';
import { CoursInterface } from '../../cours/cours-interface';
import { SeanceService } from '../../seances/seance-service';
import { SeanceInterface } from '../../seances/seance-interface';
import { AvisService } from '../../avis/avis-service';
import { AvisInterface } from '../../avis/avis-interface';
import { DisponibiliteService } from '../../disponibilites/disponibilite-service';
import { DisponibiliteInterface } from '../../disponibilites/disponibilite-interface';
import { FavoriService } from '../../favoris/favori-service';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-fiche-coach',
  imports: [DatePipe, RouterLink],
  templateUrl: './fiche-coach.html',
  styleUrl: './fiche-coach.css',
})
export class FicheCoach implements OnInit {
  private route = inject(ActivatedRoute);
  coachService = inject(CoachService);
  private coursService = inject(CoursService);
  private seanceService = inject(SeanceService);
  avisService = inject(AvisService);
  private disponibiliteService = inject(DisponibiliteService);
  favoriService = inject(FavoriService);
  authService = inject(AuthService);

  coach = signal<CoachInterface | null>(null);
  cours = signal<CoursInterface[]>([]);
  seances = signal<SeanceInterface[]>([]);
  avis = signal<AvisInterface[]>([]);
  disponibilites = signal<DisponibiliteInterface[]>([]);

  jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  // Lien du coach ("/api/coaches/12") pour retrouver ses cours, avis, disponibilités et favoris
  lienCoach = computed(() => '/api/coaches/' + this.coach()?.id);

  sesCours = computed(() => this.cours().filter((c) => c.coach === this.lienCoach()));

  // Prochaines séances ouvertes de ses cours
  prochainesSeances = computed(() => {
    const ids = this.sesCours().map((c) => c.id);
    return this.seances()
      .filter((s) => ids.includes(s.coursId) && s.statut === 'ouverte')
      .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut))
      .slice(0, 6);
  });

  // Salles et activités où il donne cours, sans doublon
  lieux = computed(() => [...new Set(this.sesCours().map((c) => c.salleNom ?? ''))].filter((l) => l !== ''));
  specialites = computed(() => [...new Set(this.sesCours().map((c) => c.activiteNom ?? ''))].filter((a) => a !== ''));

  avisDuCoach = computed(() => this.avis().filter((a) => a.statut === 'publie' && a.coach === this.lienCoach()));
  noteMoyenne = computed(() => {
    const liste = this.avisDuCoach();
    return liste.length === 0 ? 0 : Math.round((liste.reduce((s, a) => s + a.note, 0) / liste.length) * 10) / 10;
  });
  noteArrondie = computed(() => Math.round(this.noteMoyenne()));

  sesDisponibilites = computed(() =>
    this.disponibilites()
      .filter((d) => d.coach === this.lienCoach())
      .sort((a, b) => this.jours.indexOf(a.jour) - this.jours.indexOf(b.jour)),
  );

  ngOnInit(): void {
    // On lit l'id dans l'URL : /coach/2001
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.coachService.getUnCoach(id).subscribe((reponse) => this.coach.set(reponse));
    this.coursService.getCours().subscribe((reponse) => this.cours.set(reponse.member));
    this.seanceService.getSeances().subscribe((reponse) => this.seances.set(reponse.member));
    this.avisService.getAvis().subscribe((reponse) => this.avis.set(reponse.member));
    this.disponibiliteService.getDisponibilites().subscribe((reponse) => this.disponibilites.set(reponse.member));
    this.favoriService.charger();
  }

  partNote(note: number): number {
    const liste = this.avisDuCoach();
    return liste.length === 0 ? 0 : (liste.filter((a) => a.note === note).length / liste.length) * 100;
  }

  heure(valeur: string): string {
    return valeur.slice(11, 16);
  }
}
