import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminService } from '../admin-service';
import { AvisService } from '../../avis/avis-service';
import { AvisInterface } from '../../avis/avis-interface';
import { SalleService } from '../../salles/salle-service';
import { SalleInterface } from '../../salles/salle-interface';
import { CoachService } from '../../coach/coach-service';
import { CoachInterface } from '../../coach/coach-interface';
import { CoursService } from '../../cours/cours-service';
import { CoursInterface } from '../../cours/cours-interface';

@Component({
  selector: 'app-onglet-avis',
  templateUrl: './onglet-avis.html',
  styleUrl: '../admin-commun.css',
})
export class OngletAvis implements OnInit {
  adminService = inject(AdminService);
  private avisService = inject(AvisService);
  private salleService = inject(SalleService);
  private coachService = inject(CoachService);
  private coursService = inject(CoursService);

  avis = signal<AvisInterface[]>([]);
  salles = signal<SalleInterface[]>([]);
  coaches = signal<CoachInterface[]>([]);
  cours = signal<CoursInterface[]>([]);
  erreur = signal('');
  succes = signal('');
  statutFiltre = signal('tous');
  aSupprimer = signal<AvisInterface | null>(null);

  // Les avis à modérer (pas encore publiés) en premier
  avisFiltres = computed(() =>
    this.avis()
      .filter((a) => this.statutFiltre() === 'tous' || a.statut === this.statutFiltre())
      .sort((a, b) => Number(a.statut === 'publie') - Number(b.statut === 'publie')),
  );

  ngOnInit(): void {
    this.avisService.getAvis().subscribe({
      next: (reponse) => this.avis.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
    this.salleService.getSalles().subscribe((reponse) => this.salles.set(reponse.member));
    this.coachService.getCoaches().subscribe((reponse) => this.coaches.set(reponse.member));
    this.coursService.getCours().subscribe((reponse) => this.cours.set(reponse.member));
  }

  // "Salle · FitBook Liège", "Coach · Lucas Dubois" ou "Cours · Yoga du soir"
  cible(avis: AvisInterface): string {
    const id = (iri: string) => this.adminService.idDepuisIri(iri);
    if (avis.salle) return 'Salle · ' + (this.salles().find((s) => s.id === id(avis.salle!))?.nom ?? '');
    if (avis.coach) return 'Coach · ' + (this.coaches().find((c) => c.id === id(avis.coach!))?.nomComplet ?? '');
    if (avis.cours) return 'Cours · ' + (this.cours().find((c) => c.id === id(avis.cours!))?.titre ?? '');
    return '—';
  }

  etoiles(note: number): string {
    return '★'.repeat(note) + '☆'.repeat(5 - note);
  }

  // Valider = publié, refuser = caché du site
  changerStatut(avis: AvisInterface, statut: string): void {
    this.erreur.set('');
    this.succes.set('');
    this.avisService.changerStatut(avis.id!, statut).subscribe({
      next: () => {
        this.avis.update((liste) => liste.map((a) => (a.id === avis.id ? { ...a, statut } : a)));
        this.succes.set(statut === 'publie' ? 'Avis publié.' : 'Avis refusé.');
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  confirmerSuppression(): void {
    const avis = this.aSupprimer();
    if (!avis) {
      return;
    }
    this.avisService.supprimerAvis(avis.id!).subscribe({
      next: () => {
        this.avis.update((liste) => liste.filter((a) => a.id !== avis.id));
        this.succes.set('Avis supprimé.');
        this.aSupprimer.set(null);
      },
      error: (err) => {
        this.erreur.set(this.adminService.messageErreur(err));
        this.aSupprimer.set(null);
      },
    });
  }
}
