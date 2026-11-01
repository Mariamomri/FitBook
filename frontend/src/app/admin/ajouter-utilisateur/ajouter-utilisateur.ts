import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminService } from '../admin-service';
import { SidebarSportif } from '../../layout/sidebar-sportif/sidebar-sportif';

@Component({
  selector: 'app-ajouter-utilisateur',
  imports: [ReactiveFormsModule, RouterLink, SidebarSportif],
  templateUrl: './ajouter-utilisateur.html',
  styleUrl: './ajouter-utilisateur.css',
})
export class AjouterUtilisateur {
  adminService = inject(AdminService);
  private router = inject(Router);
  erreur = signal('');

  // Mêmes règles que les Assert de l'entité User côté Symfony
  utilisateurForm = new FormGroup({
    role: new FormControl('sportif', Validators.required),
    statut: new FormControl('actif', Validators.required),
    firstname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    lastname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    plainPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  creer(): void {
    this.erreur.set('');

    if (this.utilisateurForm.invalid) {
      this.utilisateurForm.markAllAsTouched();
      this.erreur.set('Veuillez remplir correctement les champs');
      return;
    }

    const { role, statut, firstname, lastname, email, phone, plainPassword } = this.utilisateurForm.value;

    this.adminService
      .creerUtilisateur({
        firstname: firstname!,
        lastname: lastname!,
        email: email!,
        phone: phone || undefined,
        plainPassword: plainPassword!,
        accentColor: 'vert',
        roles: this.adminService.rolesSymfony(role!),
        isActive: statut === 'actif',
      })
      .subscribe({
        next: () => this.router.navigate(['/dashboard'], { queryParams: { onglet: 'utilisateurs' } }),
        // 422 : email déjà utilisé ou données invalides (message renvoyé par Symfony)
        error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
      });
  }
}
