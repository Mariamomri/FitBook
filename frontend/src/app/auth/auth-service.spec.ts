import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AuthService } from './auth-service';

// Le service parle à Symfony : provideHttpClientTesting remplace le vrai serveur par un faux (aucun réseau)
describe('AuthService', () => {
  let service: AuthService;
  let serveur: HttpTestingController;

  beforeEach(() => {
    localStorage.clear(); // chaque test part d'un navigateur vide (tests indépendants)
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    serveur = TestBed.inject(HttpTestingController);
  });

  // Vérifie qu'aucune requête n'est restée sans réponse
  afterEach(() => serveur.verify());

  it('sends the email in the "username" field expected by Symfony when logging in', () => {
    // Arrange
    const email = 'emma@fitbook.be';
    const motDePasse = 'Secret123';

    // Act
    service.login(email, motDePasse).subscribe();
    const requete = serveur.expectOne('https://127.0.0.1:8000/api/login_check');

    // Assert
    expect(requete.request.method).toBe('POST');
    expect(requete.request.body).toEqual({ username: 'emma@fitbook.be', password: 'Secret123' });
    requete.flush({ token: 'abc123' });
  });

  it('keeps the token in the browser and marks the user as logged in', () => {
    // Act
    service.saveToken('abc123');

    // Assert
    expect(localStorage.getItem('token')).toBe('abc123');
    expect(service.connecte()).toBe(true);
  });

  it('removes the token and marks the user as logged out', () => {
    // Arrange
    service.saveToken('abc123');

    // Act
    service.logout();

    // Assert
    expect(service.getToken()).toBeNull();
    expect(service.connecte()).toBe(false);
  });

  it('sends the registration as JSON-LD, the format expected by API Platform', () => {
    // Act
    service.inscription({ email: 'lea@fitbook.be', firstname: 'Léa', lastname: 'Dupont', password: 'Secret123' } as any).subscribe();
    const requete = serveur.expectOne('https://127.0.0.1:8000/api/users');

    // Assert
    expect(requete.request.method).toBe('POST');
    expect(requete.request.headers.get('Content-Type')).toBe('application/ld+json');
    requete.flush({});
  });

  it('asks Symfony to send the "forgotten password" email', async () => {
    // Arrange
    const promise = firstValueFrom(service.motDePasseOublie('lea@fitbook.be'));

    // Act
    const request = serveur.expectOne({ method: 'POST', url: 'https://127.0.0.1:8000/api/mot-de-passe-oublie' });
    request.flush({ message: 'ok' });
    await promise;

    // Assert
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'lea@fitbook.be' });
  });

  it('sends the token of the email link with the new password', async () => {
    // Arrange
    const promise = firstValueFrom(service.nouveauMotDePasse('abc', 'Fitbook2026'));

    // Act
    const request = serveur.expectOne({ method: 'POST', url: 'https://127.0.0.1:8000/api/nouveau-mot-de-passe' });
    request.flush({ message: 'ok' });
    await promise;

    // Assert
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ token: 'abc', password: 'Fitbook2026' });
  });

  it('asks Symfony to send the confirmation email again', async () => {
    // Arrange
    const promise = firstValueFrom(service.renvoyerConfirmation());

    // Act
    const request = serveur.expectOne({ method: 'POST', url: 'https://127.0.0.1:8000/api/me/renvoyer-confirmation' });
    request.flush({ message: 'ok' });
    await promise;

    // Assert
    expect(request.request.method).toBe('POST');
  });

  it('loads the logged-in user with GET /api/me', async () => {
    // Arrange
    const promise = firstValueFrom(service.getMoi());

    // Act
    const request = serveur.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/me' });
    request.flush({ email: 'lea@fitbook.be' });
    await promise;

    // Assert
    expect(request.request.method).toBe('GET');
  });
});
