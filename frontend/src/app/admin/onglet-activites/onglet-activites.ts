import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../admin-service';

interface ActiviteAdmin {
  id?: number;
  nom: string;
  description?: string | null;
}

@Component({
  selector: 'app-onglet-activites',
  imports: [ReactiveFormsModule],
  templateUrl: './onglet-activites.html',
  styleUrl: '../admin-commun.css',
})
export class OngletActivites implements OnInit {
  adminService = inject(AdminService);

  activites = signal<ActiviteAdmin[]>([]);
  erreur = signal('');
  succes = signal('');

  // null = formulaire fermé, 0 = nouvelle activité, sinon id de l'activité modifiée
  idFormulaire = signal<number | null>(null);
  aSupprimer = signal<ActiviteAdmin | null>(null);

  activiteForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    description: new FormControl(''),
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.adminService.liste<ActiviteAdmin>('activites').subscribe({
      next: (reponse) => this.activites.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  ouvrirAjout(): void {
    this.activiteForm.reset();
    this.idFormulaire.set(0);
  }

  ouvrirModification(activite: ActiviteAdmin): void {
    this.activiteForm.reset({ nom: activite.nom, description: activite.description ?? '' });
    this.idFormulaire.set(activite.id!);
  }

  enregistrer(): void {
    this.erreur.set('');
    this.succes.set('');
    if (this.activiteForm.invalid) {
      this.activiteForm.markAllAsTouched();
      this.erreur.set('Le nom est obligatoire');
      return;
    }

    const donnees = { nom: this.activiteForm.value.nom, description: this.activiteForm.value.description || null };
    const id = this.idFormulaire();
    const requete =
      id === 0
        ? this.adminService.creer<ActiviteAdmin>('activites', donnees)
        : this.adminService.modifier<ActiviteAdmin>('activites', id!, donnees);

    requete.subscribe({
      next: () => {
        this.succes.set(id === 0 ? 'Activité créée.' : 'Activité modifiée.');
        this.idFormulaire.set(null);
        this.charger();
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  confirmerSuppression(): void {
    const activite = this.aSupprimer();
    if (!activite) {
      return;
    }
    this.adminService.supprimer('activites', activite.id!).subscribe({
      next: () => {
        this.activites.update((liste) => liste.filter((a) => a.id !== activite.id));
        this.succes.set(activite.nom + ' a été supprimée.');
        this.aSupprimer.set(null);
      },
      error: (err) => {
        this.erreur.set(this.adminService.messageErreur(err));
        this.aSupprimer.set(null);
      },
    });
  }
}
