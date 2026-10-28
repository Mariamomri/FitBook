import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

// Bloque l'accès aux pages privées si l'utilisateur n'est pas connecté
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.connecte()) {
    return true;
  }

  // Pas connecté : redirection vers la page de connexion
  return router.createUrlTree(['/login']);
};