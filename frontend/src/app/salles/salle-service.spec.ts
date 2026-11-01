import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SalleService } from './salle-service';
import { SalleInterface } from './salle-interface';

// Le test joue le rôle du serveur : HttpTestingController intercepte les requêtes (aucun réseau)
describe('SalleService', () => {
  let service: SalleService;
  let httpTesting: HttpTestingController;

  // Fausse réponse de Symfony
  const salles = [
    { id: 1, nom: 'Zen Center', ville: 'Bruxelles' },
    { id: 2, nom: 'Fight Club', ville: 'Liège' },
  ] as SalleInterface[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SalleService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('loads the gyms', async () => {
    // Arrange : firstValueFrom s'abonne, donc la requête part
    const promise = firstValueFrom(service.getSalles());

    // Act : le "serveur" répond
    const request = httpTesting.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/salles' });
    request.flush({ member: salles });

    // Assert
    expect((await promise).member).toEqual(salles);
  });

  it('loads one gym by id', async () => {
    // Arrange
    const promise = firstValueFrom(service.getUneSalle(1));

    // Act
    httpTesting.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/salles/1' }).flush(salles[0]);

    // Assert
    expect(await promise).toEqual(salles[0]);
  });

  it('returns an error when the server fails', async () => {
    // Arrange
    const promise = firstValueFrom(service.getSalles());

    // Act
    httpTesting
      .expectOne('https://127.0.0.1:8000/api/salles')
      .flush({ message: 'Unexpected server error' }, { status: 500, statusText: 'Internal Server Error' });

    // Assert
    await expect(promise).rejects.toMatchObject({ status: 500 });
  });

  it('returns an error with status 0 when the network fails', async () => {
    // Arrange
    const promise = firstValueFrom(service.getSalles());

    // Act
    httpTesting.expectOne('https://127.0.0.1:8000/api/salles').error(new ProgressEvent('network error'));

    // Assert
    await expect(promise).rejects.toMatchObject({ status: 0 });
  });

  it('sends only the changed fields in merge-patch format when editing', async () => {
    // Arrange
    const promise = firstValueFrom(service.modifierSalle(4, { nom: 'Zen Center' }));

    // Act
    const request = httpTesting.expectOne({ method: 'PATCH', url: 'https://127.0.0.1:8000/api/salles/4' });
    request.flush({});
    await promise;

    // Assert
    expect(request.request.headers.get('Content-Type')).toBe('application/merge-patch+json');
    expect(request.request.body).toEqual({ nom: 'Zen Center' });
  });

  it('gives the address of the photo uploaded by the manager', () => {
    // Arrange
    const salle = { imageName: 'zen.jpg' } as SalleInterface;

    // Assert
    expect( service.photo(salle) ).toBe('https://127.0.0.1:8000/images/salles/zen.jpg');
  });

  it('gives the default photo when the gym has no photo', () => {
    expect( service.photo({} as SalleInterface) ).toBe('img/gym1.jpg');
  });

  it('creates a gym in JSON-LD', async () => {
    // Arrange
    const promise = firstValueFrom(service.creerSalle({ nom: 'Zen Center' } as SalleInterface));

    // Act
    const request = httpTesting.expectOne({ method: 'POST', url: 'https://127.0.0.1:8000/api/salles' });
    request.flush({});
    await promise;

    // Assert
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Content-Type')).toBe('application/ld+json');
  });

  it('deletes a gym', async () => {
    // Arrange
    const promise = firstValueFrom(service.supprimerSalle(4));

    // Act
    const request = httpTesting.expectOne({ method: 'DELETE', url: 'https://127.0.0.1:8000/api/salles/4' });
    request.flush(null);
    await promise;

    // Assert
    expect(request.request.method).toBe('DELETE');
  });

  it('uploads the photo in a field called "imageFile", like in Symfony', async () => {
    // Arrange
    const fichier = new File(['photo'], 'zen.jpg', { type: 'image/jpeg' });
    const promise = firstValueFrom(service.envoyerPhoto(4, fichier));

    // Act
    const request = httpTesting.expectOne({ method: 'POST', url: 'https://127.0.0.1:8000/api/salles/4/image' });
    request.flush({ message: 'ok', imageName: 'zen.jpg' });
    await promise;

    // Assert
    expect((request.request.body as FormData).get('imageFile')).toBe(fichier);
  });
});
