import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth-service';
import { UserInterface } from '../../auth/user-interface';
import { ProfilService } from '../profil-service';
import { ThemeService } from '../../theme/theme-service';

@Component({
  selector: 'app-profil-modifier',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './profil-modifier.html',
  styleUrl: './profil-modifier.css',
})
export class ProfilModifier implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  profilService = inject(ProfilService);
  themeService = inject(ThemeService);

  moi = signal<UserInterface | null>(null);
  erreur = signal('');
  succes = signal('');
  erreurPhoto = signal('');

  // Mêmes règles que les Assert de l'entité User côté Symfony
  profilForm = new FormGroup({
    firstname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    lastname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    phone: new FormControl(''),
    accentColor: new FormControl('vert', Validators.required),
  });

  // On remplit le formulaire avec les données actuelles
  ngOnInit(): void {
    this.authService.getMoi().subscribe({
      next: (reponse) => {
        this.moi.set(reponse);
        this.profilForm.patchValue({
          firstname: reponse.firstname,
          lastname: reponse.lastname,
          phone: reponse.phone ?? '',
          accentColor: reponse.accentColor,
        });
      },
      error: (err) => {
        // 401 : le token a expiré, on renvoie vers la connexion
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.erreur.set('Impossible de charger le profil. Le serveur Symfony est-il lancé ?');
        }
      },
    });
  }

  // Aperçu direct : le site change de couleur dès qu'on clique
  choisirCouleur(nom: string): void {
    this.profilForm.patchValue({ accentColor: nom });
    this.themeService.appliquer(nom);
  }

  // Envoi de la photo dès qu'un fichier est choisi
  choisirPhoto(evenement: Event): void {
    const fichier = (evenement.target as HTMLInputElement).files?.[0];
    if (!fichier) {
      return;
    }
    this.erreurPhoto.set('');

    this.profilService.envoyerPhoto(fichier).subscribe({
      next: (reponse) => {
        // On met à jour seulement le nom de la photo dans le signal
        this.moi.update((user) => (user ? { ...user, imageName: reponse.imageName } : user));
      },
      error: (err) => {
        // 422 : mauvais format ou fichier trop lourd
        this.erreurPhoto.set(err.error?.message || "Erreur lors de l'envoi de la photo");
      },
    });
  }

  enregistrer(): void {
    this.erreur.set('');
    this.succes.set('');

    const user = this.moi();
    if (this.profilForm.invalid || !user) {
      this.profilForm.markAllAsTouched();
      this.erreur.set('Veuillez remplir correctement les champs');
      return;
    }

    const { firstname, lastname, phone, accentColor } = this.profilForm.value;

    this.profilService
      .modifier(user.id!, {
        firstname: firstname!,
        lastname: lastname!,
        phone: phone || undefined,
        accentColor: accentColor!,
      })
      .subscribe({
        next: () => {
          this.themeService.appliquer(accentColor!);
          this.succes.set('Profil mis à jour avec succès');
        },
        error: () => this.erreur.set('Erreur lors de la mise à jour du profil'),
      });
  }

  // Annuler : on remet la couleur du compte et on revient au profil
  annuler(): void {
    const user = this.moi();
    if (user) {
      this.themeService.appliquer(user.accentColor);
    }
    this.router.navigate(['/profil']);
  }
}
