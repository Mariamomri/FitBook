import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../admin-service';
import { UserInterface } from '../../auth/user-interface';
import { CarteMembreService } from '../../carte-membre/carte-membre-service';
import { CarteMembreAdminInterface } from '../../carte-membre/carte-membre-interface';

@Component({
  selector: 'app-onglet-cartes',
  imports: [DatePipe],
  templateUrl: './onglet-cartes.html',
  styleUrl: '../admin-commun.css',
})
export class OngletCartes implements OnInit {
  adminService = inject(AdminService);
  carteMembreService = inject(CarteMembreService);

  cartes = signal<CarteMembreAdminInterface[]>([]);
  utilisateurs = signal<UserInterface[]>([]);
  recherche = signal('');
  erreur = signal('');
  succes = signal('');
  aSupprimer = signal<CarteMembreAdminInterface | null>(null);

  // Recherche sur le numéro ou le nom du membre
  cartesFiltrees = computed(() => {
    const texte = this.recherche().toLowerCase();
    return this.cartes().filter(
      (c) => c.numeroAffiliation.toLowerCase().includes(texte) || this.membre(c.user).toLowerCase().includes(texte),
    );
  });

  ngOnInit(): void {
    this.carteMembreService.getCartes().subscribe({
      next: (reponse) => this.cartes.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
    // Pour afficher des noms à la place des liens
    this.adminService.getUtilisateurs().subscribe((reponse) => this.utilisateurs.set(reponse.member));
  }

  membre(iri: string): string {
    const user = this.utilisateurs().find((u) => u.id === this.adminService.idDepuisIri(iri));
    return user ? user.firstname + ' ' + user.lastname : '—';
  }

  // Une carte active dont la date est passée est affichée « expirée »
  statutReel(carte: CarteMembreAdminInterface): string {
    return carte.statut === 'active' && new Date(carte.dateExpiration) < new Date() ? 'expiree' : carte.statut;
  }

  changerStatut(carte: CarteMembreAdminInterface, statut: string): void {
    this.carteMembreService.modifierCarte(carte.id, { statut }).subscribe({
      next: () => {
        this.cartes.update((liste) => liste.map((c) => (c.id === carte.id ? { ...c, statut } : c)));
        this.succes.set('Carte ' + carte.numeroAffiliation + ' : ' + this.carteMembreService.libelleStatut(statut) + '.');
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  confirmerSuppression(): void {
    const carte = this.aSupprimer();
    if (!carte) {
      return;
    }
    this.carteMembreService.supprimerCarte(carte.id).subscribe({
      next: () => {
        this.cartes.update((liste) => liste.filter((c) => c.id !== carte.id));
        this.succes.set('Carte ' + carte.numeroAffiliation + ' supprimée.');
        this.aSupprimer.set(null);
      },
      error: (err) => {
        this.erreur.set(this.adminService.messageErreur(err));
        this.aSupprimer.set(null);
      },
    });
  }
}
