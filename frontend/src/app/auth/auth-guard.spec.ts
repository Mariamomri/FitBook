import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

import { authGuard } from './auth-guard';
import { AuthService } from './auth-service';

// Le guard dépend d'AuthService : on le remplace par un faux (mock) pour tester seulement le guard
describe('authGuard', () => {
  const mockAuthService: Mocked<Pick<AuthService, 'connecte'>> = {
    connecte: vi.fn() as any,
  };

  const route = {} as ActivatedRouteSnapshot;
  const etat = {} as RouterStateSnapshot;

  // Un guard utilise inject() : il doit tourner dans le contexte d'injection d'Angular
  const executerGuard = () => TestBed.runInInjectionContext(() => authGuard(route, etat));

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthService }],
    });
  });

  it('lets a logged-in user through', () => {
    // Arrange
    mockAuthService.connecte.mockReturnValue(true);

    // Act
    const resultat = executerGuard();

    // Assert
    expect(resultat).toBe(true);
  });

  it('redirects a visitor who is not logged in to /login', () => {
    // Arrange
    mockAuthService.connecte.mockReturnValue(false);

    // Act
    const resultat = executerGuard() as UrlTree;

    // Assert
    expect(TestBed.inject(Router).serializeUrl(resultat)).toBe('/login');
  });
});
