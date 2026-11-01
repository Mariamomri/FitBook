import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ActiviteService } from './activite-service';

// Règle : chaque activité connue a sa photo, sinon on affiche une photo par défaut
describe('ActiviteService', () => {
  let service: ActiviteService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ActiviteService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('gives the photo of a known activity', () => {
    expect( service.photo('Musculation') ).toBe('img/barbell.jpg');
  });

  it('ignores upper and lower case in the activity name', () => {
    expect( service.photo('hatha YOGA') ).toBe('img/yoga.jpg');
  });

  it('gives the default photo for an unknown activity', () => {
    expect( service.photo('Escalade') ).toBe('img/gym1.jpg');
  });

  it('gives the default photo when the name is missing', () => {
    expect( service.photo(undefined) ).toBe('img/gym1.jpg');
  });

  it('loads the activities', async () => {
    // Arrange
    const promise = firstValueFrom(service.getActivites());

    // Act
    httpTesting.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/activites' }).flush({ member: [{ id: 1, nom: 'Yoga' }] });

    // Assert
    expect((await promise).member.length).toBe(1);
  });

  it('creates an activity in JSON-LD', async () => {
    // Arrange
    const promise = firstValueFrom(service.creerActivite({ nom: 'Boxe' } as any));

    // Act
    const request = httpTesting.expectOne({ method: 'POST', url: 'https://127.0.0.1:8000/api/activites' });
    request.flush({ id: 2, nom: 'Boxe' });
    await promise;

    // Assert
    expect(request.request.headers.get('Content-Type')).toBe('application/ld+json');
  });

  it('edits an activity in merge-patch format', async () => {
    // Arrange
    const promise = firstValueFrom(service.modifierActivite(2, { nom: 'Kick-boxing' }));

    // Act
    const request = httpTesting.expectOne({ method: 'PATCH', url: 'https://127.0.0.1:8000/api/activites/2' });
    request.flush({});
    await promise;

    // Assert
    expect(request.request.headers.get('Content-Type')).toBe('application/merge-patch+json');
  });

  it('deletes an activity', async () => {
    // Arrange
    const promise = firstValueFrom(service.supprimerActivite(2));

    // Act
    httpTesting.expectOne({ method: 'DELETE', url: 'https://127.0.0.1:8000/api/activites/2' }).flush(null);

    // Assert
    expect(await promise).toBeNull();
  });
});
