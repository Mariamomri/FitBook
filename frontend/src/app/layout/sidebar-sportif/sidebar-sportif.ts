import { Component, OnInit, computed, inject, signal } from '@angular/core';
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

  // Liens d'administration seulement pour l'admin
  estAdmin = computed(() => this.moi()?.roles?.includes('ROLE_ADMIN') ?? false);

  estGestionnaire = computed(() => this.moi()?.roles?.includes('ROLE_SALLE') ?? false);

  // Titre du premier lien selon le rôle
  titreDashboard = computed(() => {
    if (this.estAdmin()) return 'Dashboard admin';
    if (this.estGestionnaire()) return 'Dashboard salle';
    return 'Dashboard sportif';
  });

  // Liens du gestionnaire : chacun descend vers une partie de sa dashboard (#mes-salles...)
  liensGestionnaire = [
    { fragment: 'mes-salles', libelle: 'Mes salles', icone: 'fa-house' },
    { fragment: 'cours', libelle: 'Cours & activités', icone: 'fa-list' },
    { fragment: 'avis', libelle: 'Avis', icone: 'fa-star' },
  ];

  // Liens d'administration (un par onglet de la dashboard admin)
  liensAdmin = [
    { onglet: 'utilisateurs', libelle: 'Utilisateurs', icone: 'fa-users' },
    { onglet: 'salles', libelle: 'Salles', icone: 'fa-house' },
    { onglet: 'coachs', libelle: 'Coachs', icone: 'fa-flag' },
    { onglet: 'activites', libelle: 'Activités', icone: 'fa-list' },
    { onglet: 'reservations', libelle: 'Réservations', icone: 'fa-check' },
    { onglet: 'avis', libelle: 'Avis à modérer', icone: 'fa-star' },
  ];

  // Un lien n'est actif que si l'adresse correspond exactement (onglet et ancre compris)
  optionsLienExact = { paths: 'exact', queryParams: 'exact', matrixParams: 'ignored', fragment: 'exact' } as const;

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
