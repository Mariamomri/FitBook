import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

import { adminGuard } from './admin-guard';
import { AuthService } from '../auth/auth-service';
import { UserInterface } from '../auth/user-interface';

// Le guard admin demande "qui suis-je ?" à AuthService : on contrôle la réponse avec un mock
describe('adminGuard', () => {
  const mockAuthService: Mocked<Pick<AuthService, 'getMoi'>> = {
    getMoi: vi.fn(),
  };

  const route = {} as ActivatedRouteSnapshot;
  const etat = {} as RouterStateSnapshot;

  // Le guard renvoie un Observable : on récupère sa valeur avec subscribe
  const executerGuard = (): boolean | UrlTree => {
    let resultat: boolean | UrlTree = false;
    const reponse = TestBed.runInInjectionContext(() => adminGuard(route, etat)) as Observable<boolean | UrlTree>;
    reponse.subscribe((valeur) => (resultat = valeur));
    return resultat;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthService }],
    });
  });

  it('lets an administrator through', () => {
    // Arrange
    mockAuthService.getMoi.mockReturnValue(of({ roles: ['ROLE_ADMIN', 'ROLE_USER'] } as UserInterface));

    // Act
    const resultat = executerGuard();

    // Assert
    expect(resultat).toBe(true);
  });

  it('sends a sportif to the access denied page', () => {
    // Arrange
    mockAuthService.getMoi.mockReturnValue(of({ roles: ['ROLE_USER'] } as UserInterface));

    // Act
    const resultat = executerGuard() as UrlTree;

    // Assert
    expect(TestBed.inject(Router).serializeUrl(resultat)).toBe('/acces-refuse');
  });

  it('sends the visitor to /login when the API answers with an error (expired token)', () => {
    // Arrange
    mockAuthService.getMoi.mockReturnValue(throwError(() => new Error('401')));

    // Act
    const resultat = executerGuard() as UrlTree;

    // Assert
    expect(TestBed.inject(Router).serializeUrl(resultat)).toBe('/login');
  });
});
