import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../admin-service';
import { SalleInterface } from '../../salles/salle-interface';
import { UserInterface } from '../../auth/user-interface';

// Une salle vue par l'admin : en plus, le lien vers son gestionnaire ("/api/users/12")
type SalleAdmin = SalleInterface & { gestionnaire?: string };

@Component({
  selector: 'app-onglet-salles',
  imports: [ReactiveFormsModule],
  templateUrl: './onglet-salles.html',
  styleUrl: '../admin-commun.css',
})
export class OngletSalles implements OnInit {
  adminService = inject(AdminService);

  salles = signal<SalleAdmin[]>([]);
  gestionnaires = signal<UserInterface[]>([]);
  erreur = signal('');
  succes = signal('');
  recherche = signal('');

  // Formulaire ouvert ? (null = fermé, 0 = nouvelle salle, sinon id de la salle modifiée)
  idFormulaire = signal<number | null>(null);
  aSupprimer = signal<SalleAdmin | null>(null);

  sallesFiltrees = computed(() => {
    const texte = this.recherche().toLowerCase();
    return this.salles().filter((s) => (s.nom + ' ' + s.ville).toLowerCase().includes(texte));
  });

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
    gestionnaire: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.charger();
    // Les gestionnaires possibles : comptes avec le rôle ROLE_SALLE
    this.adminService.liste<UserInterface>('users').subscribe((reponse) =>
      this.gestionnaires.set(reponse.member.filter((u) => u.roles?.includes('ROLE_SALLE'))),
    );
  }

  charger(): void {
    this.adminService.liste<SalleAdmin>('salles').subscribe({
      next: (reponse) => this.salles.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  nomGestionnaire(iri?: string): string {
    const user = this.gestionnaires().find((u) => u.id === this.adminService.idDepuisIri(iri));
    return user ? user.firstname + ' ' + user.lastname : '—';
  }

  ouvrirAjout(): void {
    this.salleForm.reset();
    this.idFormulaire.set(0);
  }

  ouvrirModification(salle: SalleAdmin): void {
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
      gestionnaire: salle.gestionnaire ?? '',
    });
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
    // Les champs vides facultatifs sont envoyés à null ; les DECIMAL sont du texte
    const donnees = {
      ...valeurs,
      equipements: valeurs.equipements || null,
      latitude: valeurs.latitude ? String(valeurs.latitude) : null,
      longitude: valeurs.longitude ? String(valeurs.longitude) : null,
    };

    const id = this.idFormulaire();
    const requete =
      id === 0
        ? this.adminService.creer<SalleAdmin>('salles', donnees)
        : this.adminService.modifier<SalleAdmin>('salles', id!, donnees);

    requete.subscribe({
      next: () => {
        this.succes.set(id === 0 ? 'Salle créée.' : 'Salle modifiée.');
        this.idFormulaire.set(null);
        this.charger();
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  confirmerSuppression(): void {
    const salle = this.aSupprimer();
    if (!salle) {
      return;
    }
    this.adminService.supprimer('salles', salle.id!).subscribe({
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
