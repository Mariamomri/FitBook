import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../admin-service';
import { UserInterface } from '../../auth/user-interface';

@Component({
  selector: 'app-onglet-utilisateurs',
  imports: [RouterLink],
  templateUrl: './onglet-utilisateurs.html',
  styleUrl: '../admin-commun.css',
})
export class OngletUtilisateurs implements OnInit {
  adminService = inject(AdminService);

  utilisateurs = signal<UserInterface[]>([]);
  erreur = signal('');
  succes = signal('');

  // Filtres
  recherche = signal('');
  roleFiltre = signal('tous');
  statutFiltre = signal('tous');

  // Ligne en cours de modification + valeurs choisies
  idEnModification = signal<number | null>(null);
  nouveauRole = signal('sportif');
  nouveauStatut = signal('actif');

  // Compte à supprimer (ouvre la fenêtre de confirmation)
  aSupprimer = signal<UserInterface | null>(null);

  utilisateursFiltres = computed(() => {
    const texte = this.recherche().toLowerCase();
    return this.utilisateurs().filter(
      (u) =>
        (u.firstname + ' ' + u.lastname + ' ' + u.email).toLowerCase().includes(texte) &&
        (this.roleFiltre() === 'tous' || this.adminService.roleDe(u) === this.roleFiltre()) &&
        (this.statutFiltre() === 'tous' || (this.statutFiltre() === 'actif') === (u.isActive !== false)),
    );
  });

  // Nombre de comptes par rôle (affiché sur les boutons de filtre)
  nombreParRole(role: string): number {
    if (role === 'tous') {
      return this.utilisateurs().length;
    }
    return this.utilisateurs().filter((u) => this.adminService.roleDe(u) === role).length;
  }

  ngOnInit(): void {
    this.adminService.liste<UserInterface>('users').subscribe({
      next: (reponse) => this.utilisateurs.set(reponse.member),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  // Ouvre la modification d'une ligne avec ses valeurs actuelles
  commencerModification(user: UserInterface): void {
    this.idEnModification.set(user.id!);
    this.nouveauRole.set(this.adminService.roleDe(user));
    this.nouveauStatut.set(user.isActive === false ? 'suspendu' : 'actif');
  }

  enregistrerModification(user: UserInterface): void {
    this.erreur.set('');
    this.succes.set('');
    const donnees = {
      roles: this.adminService.rolesSymfony(this.nouveauRole()),
      isActive: this.nouveauStatut() === 'actif',
    };

    this.adminService.modifier<UserInterface>('users', user.id!, donnees).subscribe({
      next: () => {
        this.utilisateurs.update((liste) => liste.map((u) => (u.id === user.id ? { ...u, ...donnees } : u)));
        this.idEnModification.set(null);
        this.succes.set(user.firstname + ' ' + user.lastname + ' a été modifié.');
      },
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  confirmerSuppression(): void {
    const user = this.aSupprimer();
    if (!user) {
      return;
    }
    this.erreur.set('');
    this.succes.set('');

    this.adminService.supprimer('users', user.id!).subscribe({
      next: () => {
        this.utilisateurs.update((liste) => liste.filter((u) => u.id !== user.id));
        this.succes.set(user.firstname + ' ' + user.lastname + ' a été supprimé.');
        this.aSupprimer.set(null);
      },
      error: (err) => {
        this.erreur.set(this.adminService.messageErreur(err) + ' Vous pouvez plutôt suspendre ce compte.');
        this.aSupprimer.set(null);
      },
    });
  }
}
