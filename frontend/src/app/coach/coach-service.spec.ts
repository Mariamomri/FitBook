import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CoachService } from './coach-service';

describe('CoachService', () => {
  let service: CoachService;
  let serveur: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CoachService);
    serveur = TestBed.inject(HttpTestingController);
  });

  afterEach(() => serveur.verify());

  it('reads one coach with GET /api/coaches/{id}', () => {
    // Act
    service.getUnCoach(3).subscribe();
    const requete = serveur.expectOne('https://127.0.0.1:8000/api/coaches/3');

    // Assert
    expect(requete.request.method).toBe('GET');
    requete.flush({});
  });

  it('uploads the photo in a field called "imageFile", like in Symfony', () => {
    // Arrange
    const fichier = new File(['photo'], 'coach.jpg', { type: 'image/jpeg' });

    // Act
    service.envoyerPhoto(3, fichier).subscribe();
    const requete = serveur.expectOne('https://127.0.0.1:8000/api/coaches/3/image');

    // Assert
    expect(requete.request.method).toBe('POST');
    expect((requete.request.body as FormData).get('imageFile')).toBe(fichier);
    requete.flush({ message: 'ok', imageName: 'coach.jpg' });
  });

  it('loads the coaches', async () => {
    // Arrange
    const promise = firstValueFrom(service.getCoaches());

    // Act
    const request = serveur.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/coaches' });
    request.flush({ member: [] });
    await promise;

    // Assert
    expect(request.request.method).toBe('GET');
  });

  it('creates a coach profile in JSON-LD', async () => {
    // Arrange
    const promise = firstValueFrom(service.creerCoach({ specialite: 'Yoga' } as any));

    // Act
    const request = serveur.expectOne({ method: 'POST', url: 'https://127.0.0.1:8000/api/coaches' });
    request.flush({});
    await promise;

    // Assert
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Content-Type')).toBe('application/ld+json');
  });

  it('edits a coach profile in merge-patch format', async () => {
    // Arrange
    const promise = firstValueFrom(service.modifierCoach(3, { specialite: 'Boxe' } as any));

    // Act
    const request = serveur.expectOne({ method: 'PATCH', url: 'https://127.0.0.1:8000/api/coaches/3' });
    request.flush({});
    await promise;

    // Assert
    expect(request.request.method).toBe('PATCH');
    expect(request.request.headers.get('Content-Type')).toBe('application/merge-patch+json');
  });

  it('deletes a coach profile', async () => {
    // Arrange
    const promise = firstValueFrom(service.supprimerCoach(3));

    // Act
    const request = serveur.expectOne({ method: 'DELETE', url: 'https://127.0.0.1:8000/api/coaches/3' });
    request.flush(null);
    await promise;

    // Assert
    expect(request.request.method).toBe('DELETE');
  });

  it('gives the address of the coach photo, or the default photo', () => {
    expect( service.photo({ imageName: 'emma.jpg' } as any) ).toContain('emma.jpg');
    expect( service.photo({} as any) ).not.toContain('emma.jpg');
  });
});
