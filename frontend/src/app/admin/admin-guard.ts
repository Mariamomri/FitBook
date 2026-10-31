import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../auth/auth-service';

// Pages admin : on demande à Symfony le rôle de l'utilisateur connecté
// (Symfony vérifie aussi de son côté, ceci évite juste d'afficher une page inutile)
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getMoi().pipe(
    map((moi) => (moi.roles?.includes('ROLE_ADMIN') ? true : router.createUrlTree(['/dashboard']))),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
