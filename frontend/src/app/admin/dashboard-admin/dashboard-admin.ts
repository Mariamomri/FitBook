import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminService } from '../admin-service';
import { SidebarSportif } from '../../layout/sidebar-sportif/sidebar-sportif';
import { OngletUtilisateurs } from '../onglet-utilisateurs/onglet-utilisateurs';
import { OngletSalles } from '../onglet-salles/onglet-salles';
import { OngletCoachs } from '../onglet-coachs/onglet-coachs';
import { OngletActivites } from '../onglet-activites/onglet-activites';
import { OngletReservations } from '../onglet-reservations/onglet-reservations';
import { OngletAvis } from '../onglet-avis/onglet-avis';

@Component({
  selector: 'app-dashboard-admin',
  imports: [
    RouterLink,
    SidebarSportif,
    OngletUtilisateurs,
    OngletSalles,
    OngletCoachs,
    OngletActivites,
    OngletReservations,
    OngletAvis,
  ],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.css',
})
export class DashboardAdmin implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);

  // Onglets de la gestion des données (valeur dans l'adresse : /dashboard?onglet=salles)
  onglets = [
    { valeur: 'utilisateurs', libelle: 'Utilisateurs' },
    { valeur: 'salles', libelle: 'Salles' },
    { valeur: 'coachs', libelle: 'Coachs' },
    { valeur: 'activites', libelle: 'Activités' },
    { valeur: 'reservations', libelle: 'Réservations' },
    { valeur: 'avis', libelle: 'Avis' },
  ];
  onglet = signal('utilisateurs');

  // Chiffres du haut (API Platform donne le total dans totalItems)
  nombreUtilisateurs = signal(0);
  nombreSalles = signal(0);
  nombreCoachs = signal(0);
  nombreReservations = signal(0);

  ngOnInit(): void {
    // L'onglet suit l'adresse : les liens du menu de gauche ouvrent directement le bon onglet
    this.route.queryParamMap.subscribe((parametres) => this.onglet.set(parametres.get('onglet') ?? 'utilisateurs'));

    this.adminService.liste('users').subscribe((reponse) => this.nombreUtilisateurs.set(reponse.totalItems));
    this.adminService.liste('salles').subscribe((reponse) => this.nombreSalles.set(reponse.totalItems));
    this.adminService.liste('coaches').subscribe((reponse) => this.nombreCoachs.set(reponse.totalItems));
    this.adminService.liste('reservations').subscribe((reponse) => this.nombreReservations.set(reponse.totalItems));
  }
}
