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

export const routes: Routes = [
  { path: '', component: Accueil },
  { path: 'login', component: Login },
  { path: 'inscription', component: Inscription },
  { path: 'activites', component: Activites },
  { path: 'activites/:id', component: CoursDetail },
  { path: 'salles', component: Salles },
  { path: 'coach', component: Coach },
  { path: 'contact', component: Contact },
  { path: 'reservations', component: Reservations, canActivate: [authGuard] },
  { path: 'profil', component: Profil, canActivate: [authGuard] },
  { path: 'profil/modifier', component: ProfilModifier, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'calendrier', component: Calendrier, canActivate: [authGuard] },
  { path: 'historique', component: Historique, canActivate: [authGuard] },
];