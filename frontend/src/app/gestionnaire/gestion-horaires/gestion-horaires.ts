import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { HoraireService } from '../../horaires/horaire-service';
import { HoraireInterface } from '../../horaires/horaire-interface';
import { SalleService } from '../../salles/salle-service';
import { SalleInterface } from '../../salles/salle-interface';
import { UserInterface } from '../../auth/user-interface';
import { AdminService } from '../../admin/admin-service';

@Component({
  selector: 'app-gestion-horaires',
  templateUrl: './gestion-horaires.html',
  styleUrls: ['../../admin/admin-commun.css', './gestion-horaires.css'],
})
export class GestionHoraires implements OnInit {
  private horaireService = inject(HoraireService);
  private salleService = inject(SalleService);
  private adminService = inject(AdminService);

  // Le gestionnaire connecté (donné par la dashboard)
  moi = input.required<UserInterface>();

  horaires = signal<HoraireInterface[]>([]);
  salles = signal<SalleInterface[]>([]);
  salleChoisie = signal('');
  erreur = signal('');
  succes = signal('');

  jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  mesSalles = computed(() => this.salles().filter((s) => s.gestionnaire === '/api/users/' + this.moi().id));

  // Horaires de la salle choisie (lien "/api/salles/12")
  horairesSalle = computed(() => this.horaires().filter((h) => h.salle === this.salleChoisie()));

  ngOnInit(): void {
    this.salleService.getSalles().subscribe((reponse) => {
      this.salles.set(reponse.member);
      // Par défaut : sa première salle
      const premiere = this.mesSalles()[0];
      if (premiere) {
        this.salleChoisie.set('/api/salles/' + premiere.id);
      }
    });
    this.charger();
  }

  charger(): void {
    this.horaireService.getHoraires().subscribe({
      next: (reponse) => this.horaires.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  horaireDuJour(jour: string): HoraireInterface | undefined {
    return this.horairesSalle().find((h) => h.jour === jour);
  }

  // "1970-01-01T07:00:00+00:00" → "07:00"
  heure(valeur?: string): string {
    return valeur ? valeur.slice(11, 16) : '';
  }

  // Un jour fermé = pas d'horaire en base ; sinon on crée ou on modifie l'horaire
  enregistrerJour(jour: string, ouverture: string, fermeture: string, ferme: boolean): void {
    this.erreur.set('');
    this.succes.set('');
    const existant = this.horaireDuJour(jour);

    if (ferme) {
      if (existant) {
        this.horaireService.supprimerHoraire(existant.id!).subscribe({
          next: () => this.terminer(jour + ' : fermé.'),
          error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
        });
      }
      return;
    }

    // La fermeture doit être après l'ouverture
    if (!ouverture || !fermeture || fermeture <= ouverture) {
      this.erreur.set(jour + " : l'heure de fermeture doit être après l'heure d'ouverture.");
      return;
    }

    const donnees = { jour, heureOuverture: ouverture, heureFermeture: fermeture, salle: this.salleChoisie() };
    const requete = existant
      ? this.horaireService.modifierHoraire(existant.id!, donnees)
      : this.horaireService.creerHoraire(donnees);

    requete.subscribe({
      next: () => this.terminer(jour + ' : ' + ouverture + ' – ' + fermeture + ' enregistré.'),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  terminer(message: string): void {
    this.succes.set(message);
    this.charger();
  }
}
