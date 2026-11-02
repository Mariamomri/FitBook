import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CoursService } from '../../cours/cours-service';
import { CoursInterface } from '../../cours/cours-interface';
import { SalleService } from '../../salles/salle-service';
import { SalleInterface } from '../../salles/salle-interface';
import { ActiviteService } from '../../activites/activite-service';
import { ActiviteInterface } from '../../activites/activite-interface';
import { CoachService } from '../../coach/coach-service';
import { CoachInterface } from '../../coach/coach-interface';
import { UserInterface } from '../../auth/user-interface';
import { AdminService } from '../../admin/admin-service';

@Component({
  selector: 'app-gestion-cours',
  imports: [ReactiveFormsModule],
  templateUrl: './gestion-cours.html',
  styleUrls: ['../../admin/admin-commun.css', './gestion-cours.css'],
})
export class GestionCours implements OnInit {
  private coursService = inject(CoursService);
  private salleService = inject(SalleService);
  private activiteService = inject(ActiviteService);
  private coachService = inject(CoachService);
  private adminService = inject(AdminService);

  // Le gestionnaire connecté (donné par la dashboard)
  moi = input.required<UserInterface>();

  cours = signal<CoursInterface[]>([]);
  salles = signal<SalleInterface[]>([]);
  activites = signal<ActiviteInterface[]>([]);
  coaches = signal<CoachInterface[]>([]);
  erreur = signal('');
  succes = signal('');
  recherche = signal('');

  // null = formulaire fermé, 0 = nouveau cours, sinon id du cours modifié
  idFormulaire = signal<number | null>(null);
  aSupprimer = signal<CoursInterface | null>(null);

  niveaux = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];

  // Ses salles, puis les cours qui ont lieu dans ses salles
  mesSalles = computed(() => this.salles().filter((s) => s.gestionnaire === '/api/users/' + this.moi().id));
  mesCours = computed(() => {
    const liens = this.mesSalles().map((s) => '/api/salles/' + s.id);
    const texte = this.recherche().toLowerCase();
    return this.cours().filter(
      (c) => liens.includes(c.salle ?? '') && (c.titre + ' ' + (c.coachNom ?? '')).toLowerCase().includes(texte),
    );
  });

  // Mêmes champs que l'entité Cours côté Symfony (le coach est facultatif)
  coursForm = new FormGroup({
    salle: new FormControl('', Validators.required),
    activite: new FormControl('', Validators.required),
    coach: new FormControl(''),
    titre: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    niveau: new FormControl('Tous niveaux', Validators.required),
    capacite: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    prix: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.chargerCours();
    this.salleService.getSalles().subscribe((reponse) => this.salles.set(reponse.member));
    this.activiteService.getActivites().subscribe((reponse) => this.activites.set(reponse.member));
    this.coachService.getCoaches().subscribe((reponse) => this.coaches.set(reponse.member));
  }

  chargerCours(): void {
    this.coursService.getCours().subscribe({
      next: (reponse) => this.cours.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  ouvrirAjout(): void {
    this.coursForm.reset({ niveau: 'Tous niveaux', salle: '', activite: '', coach: '' });
    this.idFormulaire.set(0);
  }

  ouvrirModification(cours: CoursInterface): void {
    this.coursForm.reset({
      salle: cours.salle ?? '',
      activite: cours.activite ?? '',
      coach: cours.coach ?? '',
      titre: cours.titre,
      niveau: cours.niveau,
      capacite: cours.capacite,
      prix: cours.prix,
      description: cours.description,
    });
    this.idFormulaire.set(cours.id!);
  }

  enregistrer(): void {
    this.erreur.set('');
    this.succes.set('');
    if (this.coursForm.invalid) {
      this.coursForm.markAllAsTouched();
      this.erreur.set('Veuillez remplir correctement les champs');
      return;
    }

    const valeurs = this.coursForm.value;
    // Sans coach : on envoie null ; prix est un DECIMAL côté Symfony (texte)
    const donnees: Partial<CoursInterface> = {
      salle: valeurs.salle!,
      activite: valeurs.activite!,
      coach: valeurs.coach || null,
      titre: valeurs.titre!,
      niveau: valeurs.niveau!,
      capacite: valeurs.capacite!,
      prix: String(valeurs.prix),
      description: valeurs.description!,
    };

    const id = this.idFormulaire();
    const requete = id === 0 ? this.coursService.creerCours(donnees) : this.coursService.modifierCours(id!, donnees);

    requete.subscribe({
      next: () => {
        this.succes.set(id === 0 ? 'Cours ajouté.' : 'Cours modifié.');
        this.idFormulaire.set(null);
        this.chargerCours();
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  confirmerSuppression(): void {
    const cours = this.aSupprimer();
    if (!cours) {
      return;
    }
    this.coursService.supprimerCours(cours.id!).subscribe({
      next: () => {
        this.cours.update((liste) => liste.filter((c) => c.id !== cours.id));
        this.succes.set(cours.titre + ' a été supprimé.');
        this.aSupprimer.set(null);
      },
      error: (err) => {
        this.erreur.set(this.adminService.messageErreur(err));
        this.aSupprimer.set(null);
      },
    });
  }
}
