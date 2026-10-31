import { Routes } from '@angular/router';
import { Accueil } from './accueil/accueil';
import { Login } from './auth/login/login';
import { Inscription } from './auth/inscription/inscription';
import { Activites } from './activites/activites';
import { Salles } from './salles/salles';
import { Coach } from './coach/coach';
import { Reservations } from './reservations/reservations';
import { Profil } from './profil/profil';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './auth/auth-guard';
import { CoursDetail } from './cours/cours-detail/cours-detail';
import { Contact } from './contact/contact';
import { Calendrier } from './calendrier/calendrier';
import { ProfilModifier } from './profil/profil-modifier/profil-modifier';
import { Historique } from './historique/historique';
import { AjouterUtilisateur } from './admin/ajouter-utilisateur/ajouter-utilisateur';
import { adminGuard } from './admin/admin-guard';
import { MesFavoris } from './favoris/mes-favoris/mes-favoris';
import { MesAvis } from './avis/mes-avis/mes-avis';
import { FicheSalle } from './salles/fiche-salle/fiche-salle';
import { FicheCoach } from './coach/fiche-coach/fiche-coach';
import { ReservationConfirmee } from './reservations/reservation-confirmee/reservation-confirmee';
import { VerifiezEmail } from './auth/verifiez-email/verifiez-email';
import { CompteConfirme } from './auth/compte-confirme/compte-confirme';
import { PageIntrouvable } from './erreurs/page-introuvable/page-introuvable';
import { AccesRefuse } from './erreurs/acces-refuse/acces-refuse';

export const routes: Routes = [
  { path: '', component: Accueil },
  { path: 'login', component: Login },
  { path: 'inscription', component: Inscription },
  { path: 'verifiez-email', component: VerifiezEmail },
  { path: 'compte-confirme', component: CompteConfirme },
  { path: 'activites', component: Activites },
  { path: 'activites/:id', component: CoursDetail },
  { path: 'salles', component: Salles },
  { path: 'salles/:id', component: FicheSalle },
  { path: 'coach', component: Coach },
  { path: 'coach/:id', component: FicheCoach },
  { path: 'contact', component: Contact },
  { path: 'reservations', component: Reservations, canActivate: [authGuard] },
  { path: 'reservation-confirmee', component: ReservationConfirmee, canActivate: [authGuard] },
  { path: 'profil', component: Profil, canActivate: [authGuard] },
  { path: 'profil/modifier', component: ProfilModifier, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'calendrier', component: Calendrier, canActivate: [authGuard] },
  { path: 'historique', component: Historique, canActivate: [authGuard] },
  { path: 'favoris', component: MesFavoris, canActivate: [authGuard] },
  { path: 'mes-avis', component: MesAvis, canActivate: [authGuard] },
  { path: 'admin/utilisateurs/nouveau', component: AjouterUtilisateur, canActivate: [authGuard, adminGuard] },
  { path: 'acces-refuse', component: AccesRefuse },
  // Toute autre adresse : page 404 (toujours en dernier)
  { path: '**', component: PageIntrouvable },
];