import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../admin-service';
import { CoachInterface } from '../../coach/coach-interface';
import { UserInterface } from '../../auth/user-interface';

// Un coach vu par l'admin : en plus, le lien vers son compte ("/api/users/12")
type CoachAdmin = CoachInterface & { user?: string };

@Component({
  selector: 'app-onglet-coachs',
  imports: [ReactiveFormsModule],
  templateUrl: './onglet-coachs.html',
  styleUrl: '../admin-commun.css',
})
export class OngletCoachs implements OnInit {
  adminService = inject(AdminService);

  coaches = signal<CoachAdmin[]>([]);
  comptesCoach = signal<UserInterface[]>([]);
  erreur = signal('');
  succes = signal('');
  recherche = signal('');

  // null = formulaire fermé, 0 = nouveau coach, sinon id du coach modifié
  idFormulaire = signal<number | null>(null);
  aSupprimer = signal<CoachAdmin | null>(null);

  coachesFiltres = computed(() => {
    const texte = this.recherche().toLowerCase();
    return this.coaches().filter((c) => (c.nomComplet + ' ' + c.langues).toLowerCase().includes(texte));
  });

  // Mêmes champs que l'entité Coach côté Symfony
  coachForm = new FormGroup({
    user: new FormControl('', Validators.required),
    biographie: new FormControl('', Validators.required),
    anneesExperience: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    tarif: new FormControl('', Validators.required),
    langues: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    certifications: new FormControl(''),
  });

  ngOnInit(): void {
    this.charger();
    // Comptes avec le rôle ROLE_COACH (la fiche coach est liée à un compte)
    this.adminService.liste<UserInterface>('users').subscribe((reponse) =>
      this.comptesCoach.set(reponse.member.filter((u) => u.roles?.includes('ROLE_COACH'))),
    );
  }

  charger(): void {
    this.adminService.liste<CoachAdmin>('coaches').subscribe({
      next: (reponse) => this.coaches.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  ouvrirAjout(): void {
    this.coachForm.reset();
    this.idFormulaire.set(0);
  }

  ouvrirModification(coach: CoachAdmin): void {
    this.coachForm.reset({
      user: coach.user ?? '',
      biographie: coach.biographie,
      anneesExperience: coach.anneesExperience,
      tarif: coach.tarif,
      langues: coach.langues,
      certifications: coach.certifications ?? '',
    });
    this.idFormulaire.set(coach.id!);
  }

  enregistrer(): void {
    this.erreur.set('');
    this.succes.set('');
    if (this.coachForm.invalid) {
      this.coachForm.markAllAsTouched();
      this.erreur.set('Veuillez remplir correctement les champs');
      return;
    }

    const valeurs = this.coachForm.value;
    // tarif est un DECIMAL côté Symfony : on l'envoie en texte
    const donnees = { ...valeurs, tarif: String(valeurs.tarif), certifications: valeurs.certifications || null };

    const id = this.idFormulaire();
    const requete =
      id === 0
        ? this.adminService.creer<CoachAdmin>('coaches', donnees)
        : this.adminService.modifier<CoachAdmin>('coaches', id!, donnees);

    requete.subscribe({
      next: () => {
        this.succes.set(id === 0 ? 'Fiche coach créée.' : 'Fiche coach modifiée.');
        this.idFormulaire.set(null);
        this.charger();
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  confirmerSuppression(): void {
    const coach = this.aSupprimer();
    if (!coach) {
      return;
    }
    this.adminService.supprimer('coaches', coach.id!).subscribe({
      next: () => {
        this.coaches.update((liste) => liste.filter((c) => c.id !== coach.id));
        this.succes.set('La fiche de ' + coach.nomComplet + ' a été supprimée.');
        this.aSupprimer.set(null);
      },
      error: (err) => {
        this.erreur.set(this.adminService.messageErreur(err));
        this.aSupprimer.set(null);
      },
    });
  }
}
