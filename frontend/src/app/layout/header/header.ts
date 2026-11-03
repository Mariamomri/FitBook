import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth-service';
import { ThemeService } from '../../theme/theme-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  authService = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  // Menu mobile (bouton burger) ouvert ou fermé
  menuOuvert = signal(false);

  // Ferme le menu mobile après un clic sur un lien
  fermerMenu(): void {
    this.menuOuvert.set(false);
  }

  deconnexion() {
    this.fermerMenu();
    this.authService.logout();
    this.themeService.appliquer('vert'); // le visiteur suivant retrouve la couleur par défaut
    this.router.navigate(['/login']);
  }
}
