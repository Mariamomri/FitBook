import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ReservationService } from './reservation-service';
import { ReservationInterface } from './reservation-interface';

describe('ReservationService', () => {
  let service: ReservationService;
  let httpTesting: HttpTestingController;

  const reservations: ReservationInterface[] = [
    { id: 1, numero: 'FB-2026-000001', statut: 'confirmee', cours: 'Yoga', salle: 'Zen', dateDebut: '30/10/2026 18:00', dateFin: '30/10/2026 19:00' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReservationService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('turns the text "30/10/2026 18:00" sent by Symfony into a real date', () => {
    // Act
    const date = service.versDate('30/10/2026 18:00');

    // Assert
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(9); // les mois commencent à 0 : 9 = octobre
    expect(date.getDate()).toBe(30);
    expect(date.getHours()).toBe(18);
  });

  it('loads the bookings of the logged-in user', async () => {
    // Arrange
    const promise = firstValueFrom(service.getMesReservations());

    // Act
    httpTesting.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/me/reservations' }).flush(reservations);

    // Assert
    expect(await promise).toEqual(reservations);
  });

  it('cancels a booking with PATCH /api/me/reservations/{id}/annuler', async () => {
    // Arrange
    const promise = firstValueFrom(service.annuler(12));

    // Act
    httpTesting
      .expectOne({ method: 'PATCH', url: 'https://127.0.0.1:8000/api/me/reservations/12/annuler' })
      .flush({ message: 'Réservation annulée.', statut: 'annulee' });

    // Assert
    expect((await promise).statut).toBe('annulee');
  });

  it('returns a 403 error when the booking belongs to someone else', async () => {
    // Arrange
    const promise = firstValueFrom(service.annuler(99));

    // Act
    httpTesting
      .expectOne('https://127.0.0.1:8000/api/me/reservations/99/annuler')
      .flush({ message: 'Accès refusé.' }, { status: 403, statusText: 'Forbidden' });

    // Assert
    await expect(promise).rejects.toMatchObject({ status: 403 });
  });

  it('draws the QR code of a booking as a PNG image', async () => {
    // Act
    const image = await service.qrCode('FB-2026-000123');

    // Assert
    expect(image).toContain('data:image/png;base64,');
  });

  it('loads all the bookings (admin)', async () => {
    // Arrange
    const promise = firstValueFrom(service.getToutesLesReservations());

    // Act
    const request = httpTesting.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/reservations' });
    request.flush({ member: [] });
    await promise;

    // Assert
    expect(request.request.method).toBe('GET');
  });

  it('deletes a booking (admin)', async () => {
    // Arrange
    const promise = firstValueFrom(service.supprimerReservation(4));

    // Act
    const request = httpTesting.expectOne({ method: 'DELETE', url: 'https://127.0.0.1:8000/api/reservations/4' });
    request.flush(null);
    await promise;

    // Assert
    expect(request.request.method).toBe('DELETE');
  });

  it('loads the bookings of my gyms (manager)', async () => {
    // Arrange
    const promise = firstValueFrom(service.getReservationsDeMesSalles());

    // Act
    const request = httpTesting.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/me/salle/reservations' });
    request.flush([]);
    await promise;

    // Assert
    expect(request.request.method).toBe('GET');
  });

  it('loads the bookings of my classes (coach)', async () => {
    // Arrange
    const promise = firstValueFrom(service.getReservationsDeMesCours());

    // Act
    const request = httpTesting.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/me/coach/reservations' });
    request.flush([]);
    await promise;

    // Assert
    expect(request.request.method).toBe('GET');
  });

  it('loads one booking by id', async () => {
    // Arrange
    const promise = firstValueFrom(service.getUneReservation(4));

    // Act
    const request = httpTesting.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/reservations/4' });
    request.flush({});
    await promise;

    // Assert
    expect(request.request.method).toBe('GET');
  });
});
