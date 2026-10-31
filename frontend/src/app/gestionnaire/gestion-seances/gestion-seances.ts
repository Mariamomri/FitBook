import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { SeanceService } from '../../seances/seance-service';
import { SeanceInterface } from '../../seances/seance-interface';
import { CoursService } from '../../cours/cours-service';
import { CoursInterface } from '../../cours/cours-interface';
import { SalleService } from '../../salles/salle-service';
import { SalleInterface } from '../../salles/salle-interface';
import { UserInterface } from '../../auth/user-interface';
import { AdminService } from '../../admin/admin-service';

// Une case du calendrier : un numéro de jour (ou vide) + les séances de ce jour
interface CaseJour {
  jour: number | null;
  seances: SeanceInterface[];
}

@Component({
  selector: 'app-gestion-seances',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './gestion-seances.html',
  styleUrls: ['../../admin/admin-commun.css', './gestion-seances.css'],
})
export class GestionSeances implements OnInit {
  private seanceService = inject(SeanceService);
  private coursService = inject(CoursService);
  private salleService = inject(SalleService);
  private adminService = inject(AdminService);

  // Le gestionnaire connecté (donné par la dashboard)
  moi = input.required<UserInterface>();

  seances = signal<SeanceInterface[]>([]);
  cours = signal<CoursInterface[]>([]);
  salles = signal<SalleInterface[]>([]);
  erreur = signal('');
  succes = signal('');
  formulaireOuvert = signal(false);
  aSupprimer = signal<SeanceInterface | null>(null);

  joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  aujourdhui = new Date();
  moisAffiche = signal(new Date(this.aujourdhui.getFullYear(), this.aujourdhui.getMonth(), 1));

  // Ses salles → ses cours → les séances de ses cours (la plus proche en premier)
  mesCours = computed(() => {
    const liens = this.salles()
      .filter((s) => s.gestionnaire === '/api/users/' + this.moi().id)
      .map((s) => '/api/salles/' + s.id);
    return this.cours().filter((c) => liens.includes(c.salle ?? ''));
  });
  mesSeances = computed(() => {
    const ids = this.mesCours().map((c) => c.id);
    return this.seances()
      .filter((s) => ids.includes(s.coursId))
      .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));
  });

  // Calendrier du mois : cases vides avant le 1er, puis un jour par case
  cases = computed<CaseJour[]>(() => {
    const annee = this.moisAffiche().getFullYear();
    const mois = this.moisAffiche().getMonth();
    const decalage = (new Date(annee, mois, 1).getDay() + 6) % 7; // la semaine commence le lundi
    const nombreJours = new Date(annee, mois + 1, 0).getDate();

    const liste: CaseJour[] = [];
    for (let i = 0; i < decalage; i++) {
      liste.push({ jour: null, seances: [] });
    }
    for (let jour = 1; jour <= nombreJours; jour++) {
      const date = annee + '-' + String(mois + 1).padStart(2, '0') + '-' + String(jour).padStart(2, '0');
      liste.push({ jour, seances: this.mesSeances().filter((s) => s.dateDebut.startsWith(date)) });
    }
    return liste;
  });

  seanceForm = new FormGroup({
    cours: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    heureDebut: new FormControl('18:00', Validators.required),
    heureFin: new FormControl('19:00', Validators.required),
  });

  ngOnInit(): void {
    this.charger();
    this.coursService.getCours().subscribe((reponse) => this.cours.set(reponse.member));
    this.salleService.getSalles().subscribe((reponse) => this.salles.set(reponse.member));
  }

  charger(): void {
    this.seanceService.getSeances().subscribe({
      next: (reponse) => this.seances.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  // Capacité du cours, pour afficher "places prises / capacité"
  capacite(seance: SeanceInterface): number {
    return this.mesCours().find((c) => c.id === seance.coursId)?.capacite ?? 0;
  }

  estAujourdhui(jour: number | null): boolean {
    return (
      jour === this.aujourdhui.getDate() &&
      this.moisAffiche().getMonth() === this.aujourdhui.getMonth() &&
      this.moisAffiche().getFullYear() === this.aujourdhui.getFullYear()
    );
  }

  moisPrecedent(): void {
    const m = this.moisAffiche();
    this.moisAffiche.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  moisSuivant(): void {
    const m = this.moisAffiche();
    this.moisAffiche.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  ajouter(): void {
    this.erreur.set('');
    this.succes.set('');
    const { cours, date, heureDebut, heureFin } = this.seanceForm.value;

    if (this.seanceForm.invalid || heureFin! <= heureDebut!) {
      this.seanceForm.markAllAsTouched();
      this.erreur.set("Choisissez un cours, une date, et une heure de fin après l'heure de début.");
      return;
    }

    // Heures enregistrées telles quelles (le site les affiche en UTC)
    this.seanceService
      .creerSeance({
        cours: cours!,
        dateDebut: date + 'T' + heureDebut + ':00+00:00',
        dateFin: date + 'T' + heureFin + ':00+00:00',
        statut: 'ouverte',
      })
      .subscribe({
        next: () => {
          this.succes.set('Séance ajoutée.');
          this.formulaireOuvert.set(false);
          this.charger();
        },
        error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
      });
  }

  // Annuler une séance : elle reste visible, mais n'est plus réservable
  annuler(seance: SeanceInterface): void {
    this.seanceService.modifierSeance(seance.id, { statut: 'annulee' }).subscribe({
      next: () => {
        this.seances.update((liste) => liste.map((s) => (s.id === seance.id ? { ...s, statut: 'annulee' } : s)));
        this.succes.set('Séance annulée.');
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  confirmerSuppression(): void {
    const seance = this.aSupprimer();
    if (!seance) {
      return;
    }
    this.seanceService.supprimerSeance(seance.id).subscribe({
      next: () => {
        this.seances.update((liste) => liste.filter((s) => s.id !== seance.id));
        this.succes.set('Séance supprimée.');
        this.aSupprimer.set(null);
      },
      error: (err) => {
        this.erreur.set(this.adminService.messageErreur(err));
        this.aSupprimer.set(null);
      },
    });
  }
}
