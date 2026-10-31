import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DisponibiliteService } from '../../disponibilites/disponibilite-service';
import { DisponibiliteInterface } from '../../disponibilites/disponibilite-interface';
import { AdminService } from '../../admin/admin-service';

@Component({
  selector: 'app-gestion-disponibilites',
  imports: [ReactiveFormsModule],
  templateUrl: './gestion-disponibilites.html',
  styleUrls: ['../../admin/admin-commun.css', './gestion-disponibilites.css'],
})
export class GestionDisponibilites implements OnInit {
  private disponibiliteService = inject(DisponibiliteService);
  private adminService = inject(AdminService);

  // Lien de sa fiche coach, ex. "/api/coaches/12" (donné par la dashboard)
  coachLien = input.required<string>();

  disponibilites = signal<DisponibiliteInterface[]>([]);
  erreur = signal('');
  succes = signal('');
  idFormulaire = signal<number | null>(null); // null = fermé, 0 = nouveau créneau

  jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  // Ses créneaux, dans l'ordre de la semaine puis de l'heure
  mesDisponibilites = computed(() =>
    this.disponibilites()
      .filter((d) => d.coach === this.coachLien())
      .sort(
        (a, b) =>
          this.jours.indexOf(a.jour) - this.jours.indexOf(b.jour) || a.heureDebut.localeCompare(b.heureDebut),
      ),
  );

  disponibiliteForm = new FormGroup({
    jour: new FormControl('lundi', Validators.required),
    heureDebut: new FormControl('09:00', Validators.required),
    heureFin: new FormControl('12:00', Validators.required),
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.disponibiliteService.getDisponibilites().subscribe({
      next: (reponse) => this.disponibilites.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  // "1970-01-01T09:00:00+00:00" → "09:00"
  heure(valeur: string): string {
    return valeur.slice(11, 16);
  }

  ouvrirAjout(): void {
    this.disponibiliteForm.reset({ jour: 'lundi', heureDebut: '09:00', heureFin: '12:00' });
    this.idFormulaire.set(0);
  }

  ouvrirModification(disponibilite: DisponibiliteInterface): void {
    this.disponibiliteForm.reset({
      jour: disponibilite.jour,
      heureDebut: this.heure(disponibilite.heureDebut),
      heureFin: this.heure(disponibilite.heureFin),
    });
    this.idFormulaire.set(disponibilite.id!);
  }

  enregistrer(): void {
    this.erreur.set('');
    this.succes.set('');
    const { jour, heureDebut, heureFin } = this.disponibiliteForm.value;

    // La fin doit être après le début
    if (this.disponibiliteForm.invalid || heureFin! <= heureDebut!) {
      this.erreur.set("L'heure de fin doit être après l'heure de début.");
      return;
    }

    const donnees = { jour: jour!, heureDebut: heureDebut!, heureFin: heureFin!, coach: this.coachLien() };
    const id = this.idFormulaire();
    const requete =
      id === 0
        ? this.disponibiliteService.creerDisponibilite(donnees)
        : this.disponibiliteService.modifierDisponibilite(id!, donnees);

    requete.subscribe({
      next: () => {
        this.succes.set(id === 0 ? 'Disponibilité ajoutée.' : 'Disponibilité modifiée.');
        this.idFormulaire.set(null);
        this.charger();
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  supprimer(disponibilite: DisponibiliteInterface): void {
    this.disponibiliteService.supprimerDisponibilite(disponibilite.id!).subscribe({
      next: () => {
        this.disponibilites.update((liste) => liste.filter((d) => d.id !== disponibilite.id));
        this.succes.set('Disponibilité supprimée.');
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }
}
