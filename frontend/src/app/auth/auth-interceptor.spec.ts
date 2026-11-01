import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { authInterceptor } from './auth-interceptor';
import { AuthService } from './auth-service';

// Test d'intégration : HttpClient + intercepteur + AuthService travaillent ensemble (faux serveur, aucun réseau)
describe('authInterceptor', () => {
  let http: HttpClient;
  let serveur: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    serveur = TestBed.inject(HttpTestingController);
  });

  afterEach(() => serveur.verify());

  it('adds "Authorization: Bearer <token>" when the user is logged in', () => {
    // Arrange
    TestBed.inject(AuthService).saveToken('abc123');

    // Act
    http.get('https://127.0.0.1:8000/api/me').subscribe();
    const requete = serveur.expectOne('https://127.0.0.1:8000/api/me');

    // Assert
    expect(requete.request.headers.get('Authorization')).toBe('Bearer abc123');
    requete.flush({});
  });

  it('adds no header when the user is not logged in', () => {
    // Act
    http.get('https://127.0.0.1:8000/api/salles').subscribe();
    const requete = serveur.expectOne('https://127.0.0.1:8000/api/salles');

    // Assert
    expect(requete.request.headers.has('Authorization')).toBe(false);
    requete.flush({ member: [] });
  });
});
