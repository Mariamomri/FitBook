import { Component, inject } from '@angular/core';
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
  private themeService = inject(ThemeService);

  deconnexion() {
    this.authService.logout();
    this.themeService.appliquer('vert'); // le visiteur suivant retrouve la couleur par défaut
    this.router.navigate(['/login']);
  }
}