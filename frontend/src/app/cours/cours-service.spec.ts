import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CoursService } from './cours-service';

describe('CoursService', () => {
  let service: CoursService;
  let serveur: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CoursService);
    serveur = TestBed.inject(HttpTestingController);
  });

  afterEach(() => serveur.verify());

  it('reads the list of classes in the "member" field returned by API Platform', () => {
    // Arrange
    let nombre = 0;

    // Act
    service.getCours().subscribe((reponse) => (nombre = reponse.member.length));
    const requete = serveur.expectOne('https://127.0.0.1:8000/api/cours');
    requete.flush({ member: [{ id: 1 }, { id: 2 }] });

    // Assert
    expect(requete.request.method).toBe('GET');
    expect(nombre).toBe(2);
  });

  it('creates a class in JSON-LD, the format expected by API Platform', () => {
    // Act
    service.creerCours({ titre: 'Yoga du matin' } as any).subscribe();
    const requete = serveur.expectOne('https://127.0.0.1:8000/api/cours');

    // Assert
    expect(requete.request.method).toBe('POST');
    expect(requete.request.headers.get('Content-Type')).toBe('application/ld+json');
    requete.flush({});
  });

  it('loads one class by id', async () => {
    // Arrange
    const promise = firstValueFrom(service.getUnCours(5));

    // Act
    const request = serveur.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/cours/5' });
    request.flush({});
    await promise;

    // Assert
    expect(request.request.method).toBe('GET');
  });

  it('edits a class in merge-patch format', async () => {
    // Arrange
    const promise = firstValueFrom(service.modifierCours(5, { titre: 'Yoga doux' } as any));

    // Act
    const request = serveur.expectOne({ method: 'PATCH', url: 'https://127.0.0.1:8000/api/cours/5' });
    request.flush({});
    await promise;

    // Assert
    expect(request.request.method).toBe('PATCH');
    expect(request.request.headers.get('Content-Type')).toBe('application/merge-patch+json');
  });

  it('deletes a class', async () => {
    // Arrange
    const promise = firstValueFrom(service.supprimerCours(5));

    // Act
    const request = serveur.expectOne({ method: 'DELETE', url: 'https://127.0.0.1:8000/api/cours/5' });
    request.flush(null);
    await promise;

    // Assert
    expect(request.request.method).toBe('DELETE');
  });

  it('uses the photo uploaded for the class, otherwise the photo of its activity', () => {
    // Act
    const photoEnvoyee = service.photo('yoga-123.jpg', 'Yoga');
    const photoActivite = service.photo(null, 'Crossfit');

    // Assert
    expect(photoEnvoyee).toBe('https://127.0.0.1:8000/images/cours/yoga-123.jpg');
    expect(photoActivite).toBe('img/crossfit.jpg');
  });

  it('sends the class photo as FormData in the imageFile field', () => {
    // Arrange
    const fichier = new File(['photo'], 'cours.jpg', { type: 'image/jpeg' });

    // Act
    service.envoyerPhoto(7, fichier).subscribe();
    const requete = serveur.expectOne('https://127.0.0.1:8000/api/cours/7/image');

    // Assert
    expect(requete.request.method).toBe('POST');
    expect((requete.request.body as FormData).get('imageFile')).toBe(fichier);
    requete.flush({ message: 'Photo enregistrée.', imageName: 'cours-7.jpg' });
  });
});
