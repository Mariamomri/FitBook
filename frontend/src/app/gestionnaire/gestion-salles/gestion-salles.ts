import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { SalleService } from '../../salles/salle-service';
import { SalleInterface } from '../../salles/salle-interface';
import { UserInterface } from '../../auth/user-interface';
import { AdminService } from '../../admin/admin-service';

@Component({
  selector: 'app-gestion-salles',
  imports: [ReactiveFormsModule],
  templateUrl: './gestion-salles.html',
  styleUrls: ['../../admin/admin-commun.css', './gestion-salles.css'],
})
export class GestionSalles implements OnInit {
  salleService = inject(SalleService);
  private adminService = inject(AdminService);

  // Le gestionnaire connecté (donné par la dashboard)
  moi = input.required<UserInterface>();

  salles = signal<SalleInterface[]>([]);
  erreur = signal('');
  succes = signal('');

  // null = formulaire fermé, 0 = nouvelle salle, sinon id de la salle modifiée
  idFormulaire = signal<number | null>(null);
  aSupprimer = signal<SalleInterface | null>(null);

  // Photo choisie dans le formulaire (envoyée juste après l'enregistrement de la salle)
  photoChoisie = signal<File | null>(null);
  apercuPhoto = signal<string | null>(null);

  // Seulement les salles dont il est le gestionnaire
  mesSalles = computed(() => this.salles().filter((s) => s.gestionnaire === '/api/users/' + this.moi().id));

  // Mêmes champs que l'entité Salle côté Symfony
  salleForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    adresse: new FormControl('', Validators.required),
    codePostal: new FormControl('', [Validators.required, Validators.maxLength(10)]),
    ville: new FormControl('', Validators.required),
    telephone: new FormControl('', Validators.required),
    capacite: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    description: new FormControl('', Validators.required),
    equipements: new FormControl(''),
    latitude: new FormControl(''),
    longitude: new FormControl(''),
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.salleService.getSalles().subscribe({
      next: (reponse) => this.salles.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  ouvrirAjout(): void {
    this.salleForm.reset();
    this.photoChoisie.set(null);
    this.apercuPhoto.set(null);
    this.idFormulaire.set(0);
  }

  ouvrirModification(salle: SalleInterface): void {
    this.salleForm.reset({
      nom: salle.nom,
      adresse: salle.adresse,
      codePostal: salle.codePostal,
      ville: salle.ville,
      telephone: salle.telephone,
      capacite: salle.capacite,
      description: salle.description,
      equipements: salle.equipements ?? '',
      latitude: salle.latitude ?? '',
      longitude: salle.longitude ?? '',
    });
    this.photoChoisie.set(null);
    this.apercuPhoto.set(null);
    this.idFormulaire.set(salle.id!);
  }

  enregistrer(): void {
    this.erreur.set('');
    this.succes.set('');
    if (this.salleForm.invalid) {
      this.salleForm.markAllAsTouched();
      this.erreur.set('Veuillez remplir correctement les champs');
      return;
    }

    const valeurs = this.salleForm.value;
    // La salle appartient toujours au gestionnaire connecté ; les DECIMAL sont du texte
    const donnees = {
      ...(valeurs as SalleInterface),
      equipements: valeurs.equipements || null,
      latitude: valeurs.latitude ? String(valeurs.latitude) : null,
      longitude: valeurs.longitude ? String(valeurs.longitude) : null,
      gestionnaire: '/api/users/' + this.moi().id,
    };

    const id = this.idFormulaire();
    const requete = id === 0 ? this.salleService.creerSalle(donnees) : this.salleService.modifierSalle(id!, donnees);

    requete.subscribe({
      next: (salle) => this.terminerEnregistrement(salle, id === 0 ? 'Salle créée.' : 'Salle modifiée.'),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  // Envoi de la photo dès qu'un fichier est choisi
  choisirPhoto(salle: SalleInterface, evenement: Event): void {
    const fichier = (evenement.target as HTMLInputElement).files?.[0];
    if (!fichier) {
      return;
    }
    this.erreur.set('');
    this.salleService.envoyerPhoto(salle.id!, fichier).subscribe({
      next: (reponse) => {
        this.salles.update((liste) => liste.map((s) => (s.id === salle.id ? { ...s, imageName: reponse.imageName } : s)));
        this.succes.set('Photo de ' + salle.nom + ' enregistrée.');
      },
      // 422 : mauvais format ou fichier trop lourd
      error: (err) => this.erreur.set(err.error?.message ?? "Erreur lors de l'envoi de la photo"),
    });
  }

  // Garde le fichier choisi et affiche un aperçu avant l'envoi
  choisirPhotoFormulaire(evenement: Event): void {
    const fichier = (evenement.target as HTMLInputElement).files?.[0] ?? null;
    this.photoChoisie.set(fichier);
    this.apercuPhoto.set(fichier ? URL.createObjectURL(fichier) : null);
  }

  // Après l'enregistrement : envoie la photo s'il y en a une, puis recharge la liste
  terminerEnregistrement(salle: SalleInterface, message: string): void {
    const fichier = this.photoChoisie();
    if (!fichier) {
      this.finir(message);
      return;
    }
    this.salleService.envoyerPhoto(salle.id!, fichier).subscribe({
      next: () => this.finir(message + ' Photo enregistrée.'),
      // La salle est enregistrée, seule la photo pose problème (format ou taille)
      error: (err) => {
        this.finir(message);
        this.erreur.set(err.error?.message ?? "Erreur lors de l'envoi de la photo");
      },
    });
  }

  finir(message: string): void {
    this.succes.set(message);
    this.idFormulaire.set(null);
    this.photoChoisie.set(null);
    this.apercuPhoto.set(null);
    this.charger();
  }

  confirmerSuppression(): void {
    const salle = this.aSupprimer();
    if (!salle) {
      return;
    }
    this.salleService.supprimerSalle(salle.id!).subscribe({
      next: () => {
        this.salles.update((liste) => liste.filter((s) => s.id !== salle.id));
        this.succes.set(salle.nom + ' a été supprimée.');
        this.aSupprimer.set(null);
      },
      error: (err) => {
        this.erreur.set(this.adminService.messageErreur(err));
        this.aSupprimer.set(null);
      },
    });
  }
}
