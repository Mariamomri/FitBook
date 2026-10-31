import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth-service';
import { UserInterface } from '../../auth/user-interface';
import { ProfilService } from '../../profil/profil-service';
import { ThemeService } from '../../theme/theme-service';

@Component({
  selector: 'app-sidebar-sportif',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-sportif.html',
  styleUrl: './sidebar-sportif.css',
})
export class SidebarSportif implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);
  profilService = inject(ProfilService);

  moi = signal<UserInterface | null>(null);

  // Nom et photo affichés en haut du menu
  ngOnInit(): void {
    this.authService.getMoi().subscribe((reponse) => this.moi.set(reponse));
  }

  deconnexion(): void {
    this.authService.logout();
    this.themeService.appliquer('vert');
    this.router.navigate(['/login']);
  }
}
