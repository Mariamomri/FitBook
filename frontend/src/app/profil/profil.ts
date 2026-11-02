import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth-service';
import { UserInterface } from '../auth/user-interface';
import { ProfilService } from './profil-service';
import { ThemeService } from '../theme/theme-service';

@Component({
  selector: 'app-profil',
  imports: [RouterLink],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  profilService = inject(ProfilService);
  themeService = inject(ThemeService);

  moi = signal<UserInterface | null>(null);
  erreur = signal('');

  // Au chargement : on demande à Symfony qui est connecté
  ngOnInit(): void {
    this.authService.getMoi().subscribe({
      next: (reponse) => this.moi.set(reponse),
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

  // Libellé et code de la couleur choisie (ex. "Vert" et #a6ff00)
  couleur(nom: string) {
    return this.themeService.couleurs.find((c) => c.nom === nom) ?? this.themeService.couleurs[0];
  }
}
