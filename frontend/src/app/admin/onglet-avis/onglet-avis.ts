import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { AdminService } from '../admin-service';

// Avis tel que renvoyé par API Platform : la cible (salle, coach ou cours) est un lien
interface AvisAdmin {
  id: number;
  note: number;
  commentaire: string;
  statut: string;
  salle?: string | null;
  coach?: string | null;
  cours?: string | null;
}

// Élément simple pour retrouver un nom à partir d'un id
interface ElementNomme {
  id: number;
  nom?: string;
  titre?: string;
  nomComplet?: string;
}

@Component({
  selector: 'app-onglet-avis',
  templateUrl: './onglet-avis.html',
  styleUrl: '../admin-commun.css',
})
export class OngletAvis implements OnInit {
  adminService = inject(AdminService);

  avis = signal<AvisAdmin[]>([]);
  salles = signal<ElementNomme[]>([]);
  coaches = signal<ElementNomme[]>([]);
  cours = signal<ElementNomme[]>([]);
  erreur = signal('');
  succes = signal('');
  statutFiltre = signal('tous');
  aSupprimer = signal<AvisAdmin | null>(null);

  // Les avis à modérer (pas encore publiés) en premier
  avisFiltres = computed(() =>
    this.avis()
      .filter((a) => this.statutFiltre() === 'tous' || a.statut === this.statutFiltre())
      .sort((a, b) => Number(a.statut === 'publie') - Number(b.statut === 'publie')),
  );

  ngOnInit(): void {
    this.adminService.liste<AvisAdmin>('avis').subscribe({
      next: (reponse) => this.avis.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
    this.adminService.liste<ElementNomme>('salles').subscribe((reponse) => this.salles.set(reponse.member));
    this.adminService.liste<ElementNomme>('coaches').subscribe((reponse) => this.coaches.set(reponse.member));
    this.adminService.liste<ElementNomme>('cours').subscribe((reponse) => this.cours.set(reponse.member));
  }

  // "Salle · FitBook Liège", "Coach · Lucas Dubois" ou "Cours · Yoga du soir"
  cible(avis: AvisAdmin): string {
    const trouver = (liste: ElementNomme[], iri: string) =>
      liste.find((element) => element.id === this.adminService.idDepuisIri(iri));
    if (avis.salle) return 'Salle · ' + (trouver(this.salles(), avis.salle)?.nom ?? '');
    if (avis.coach) return 'Coach · ' + (trouver(this.coaches(), avis.coach)?.nomComplet ?? '');
    if (avis.cours) return 'Cours · ' + (trouver(this.cours(), avis.cours)?.titre ?? '');
    return '—';
  }

  etoiles(note: number): string {
    return '★'.repeat(note) + '☆'.repeat(5 - note);
  }

  // Valider = publié, refuser = caché du site
  changerStatut(avis: AvisAdmin, statut: string): void {
    this.erreur.set('');
    this.succes.set('');
    this.adminService.modifier<AvisAdmin>('avis', avis.id, { statut }).subscribe({
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
    this.adminService.supprimer('avis', avis.id).subscribe({
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
