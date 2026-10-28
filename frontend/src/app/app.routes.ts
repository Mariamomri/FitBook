import { Routes } from '@angular/router';
import { Accueil } from './accueil/accueil';
import { Login } from './auth/login/login';
import { Inscription } from './auth/inscription/inscription';
import { Activites } from './activites/activites';
import { Salles } from './salles/salles';
import { Cours } from './cours/cours';
import { Coach } from './coach/coach';
import { Reservations } from './reservations/reservations';
import { Profil } from './profil/profil';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Accueil },
  { path: 'login', component: Login },
  { path: 'inscription', component: Inscription },
  { path: 'activites', component: Activites },
  { path: 'salles', component: Salles },
  { path: 'cours', component: Cours },
  { path: 'coach', component: Coach },
  { path: 'reservations', component: Reservations },
  { path: 'profil', component: Profil },
  { path: 'dashboard', component: Dashboard },
];