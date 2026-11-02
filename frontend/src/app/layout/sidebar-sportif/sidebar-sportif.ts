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
  estCoach = computed(() => this.moi()?.roles?.includes('ROLE_COACH') ?? false);

  // Titre du premier lien selon le rôle
  titreDashboard = computed(() => {
    if (this.estAdmin()) return 'Dashboard admin';
    if (this.estGestionnaire()) return 'Dashboard salle';
    if (this.estCoach()) return 'Dashboard coach';
    return 'Dashboard sportif';
  });

  // Liens du gestionnaire : chacun descend vers une partie de sa dashboard (#mes-salles...)
  liensGestionnaire = [
    { fragment: 'mes-salles', libelle: 'Mes salles', icone: 'fa-house' },
    { fragment: 'cours', libelle: 'Cours', icone: 'fa-list' },
    { fragment: 'activites', libelle: 'Activités', icone: 'fa-dumbbell' },
    { fragment: 'horaires', libelle: 'Horaires', icone: 'fa-clock' },
    { fragment: 'calendrier', libelle: 'Calendrier & séances', icone: 'fa-calendar-days' },
    { fragment: 'reservations', libelle: 'Réservations', icone: 'fa-ticket' },
    { fragment: 'avis', libelle: 'Avis', icone: 'fa-star' },
  ];

  // Liens du coach vers les parties de sa dashboard
  liensCoach = [
    { fragment: 'profil-pro', libelle: 'Profil professionnel', icone: 'fa-id-card' },
    { fragment: 'photos-cours', libelle: 'Photos des cours', icone: 'fa-image' },
    { fragment: 'seances', libelle: 'Séances & calendrier', icone: 'fa-calendar-days' },
    { fragment: 'disponibilites', libelle: 'Disponibilités', icone: 'fa-clock' },
    { fragment: 'reservations', libelle: 'Réservations', icone: 'fa-ticket' },
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
    { onglet: 'cartes', libelle: 'Cartes membre', icone: 'fa-id-card' },
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
