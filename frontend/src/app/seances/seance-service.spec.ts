import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SeanceService } from './seance-service';

describe('SeanceService', () => {
  let service: SeanceService;
  let serveur: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SeanceService);
    serveur = TestBed.inject(HttpTestingController);
  });

  afterEach(() => serveur.verify());

  it('books a session by sending only the session link (Symfony adds the user)', () => {
    // Act
    service.reserver(7).subscribe();
    const requete = serveur.expectOne('https://127.0.0.1:8000/api/reservations');

    // Assert
    expect(requete.request.method).toBe('POST');
    expect(requete.request.body).toEqual({ seance: '/api/seances/7' });
    requete.flush({ id: 1, numero: 'FB-2026-000001' });
  });

  it('filters the sessions of one class with ?cours={id}', () => {
    // Act
    service.getSeancesDuCours(5).subscribe();
    const requete = serveur.expectOne('https://127.0.0.1:8000/api/seances?cours=5');

    // Assert
    expect(requete.request.method).toBe('GET');
    requete.flush({ member: [] });
  });

  it('loads all the sessions', async () => {
    // Arrange
    const promise = firstValueFrom(service.getSeances());

    // Act
    const request = serveur.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/seances' });
    request.flush({ member: [] });
    await promise;

    // Assert
    expect(request.request.method).toBe('GET');
  });

  it('loads one session by id', async () => {
    // Arrange
    const promise = firstValueFrom(service.getUneSeance(7));

    // Act
    const request = serveur.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/seances/7' });
    request.flush({});
    await promise;

    // Assert
    expect(request.request.method).toBe('GET');
  });

  it('creates a session in JSON-LD', async () => {
    // Arrange
    const promise = firstValueFrom(service.creerSeance({ cours: '/api/cours/5', dateDebut: '2026-12-01T10:00', dateFin: '2026-12-01T11:00', statut: 'ouverte' }));

    // Act
    const request = serveur.expectOne({ method: 'POST', url: 'https://127.0.0.1:8000/api/seances' });
    request.flush({});
    await promise;

    // Assert
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Content-Type')).toBe('application/ld+json');
  });

  it('cancels a session by changing its status (merge-patch)', async () => {
    // Arrange
    const promise = firstValueFrom(service.modifierSeance(7, { statut: 'annulee' } as any));

    // Act
    const request = serveur.expectOne({ method: 'PATCH', url: 'https://127.0.0.1:8000/api/seances/7' });
    request.flush({});
    await promise;

    // Assert
    expect(request.request.method).toBe('PATCH');
    expect(request.request.headers.get('Content-Type')).toBe('application/merge-patch+json');
  });

  it('deletes a session', async () => {
    // Arrange
    const promise = firstValueFrom(service.supprimerSeance(7));

    // Act
    const request = serveur.expectOne({ method: 'DELETE', url: 'https://127.0.0.1:8000/api/seances/7' });
    request.flush(null);
    await promise;

    // Assert
    expect(request.request.method).toBe('DELETE');
  });
});
