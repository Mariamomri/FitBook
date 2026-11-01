import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Reservations } from './reservations';

// Test d'intégration, sans mock : composant + vrai ReservationService + HttpClient
// Seul le serveur est faux (HttpTestingController) : le test joue le rôle de Symfony
describe('Reservations (integration)', () => {
  let fixture: ComponentFixture<Reservations>;
  let serveur: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reservations],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Reservations);
    serveur = TestBed.inject(HttpTestingController);
  });

  // Les autres requêtes (menu de gauche...) ne nous intéressent pas ici
  afterEach(() => serveur.match(() => true));

  it('loads my bookings from the API, cancels one and updates the table', () => {
    // Arrange : la page demande mes réservations, le "serveur" répond
    fixture.detectChanges();
    serveur.expectOne({ method: 'GET', url: 'https://127.0.0.1:8000/api/me/reservations' }).flush([
      { id: 12, numero: 'FB-2026-000012', statut: 'confirmee', cours: 'Yoga', salle: 'Zen Center', dateDebut: '30/11/2026 18:00', dateFin: '30/11/2026 19:00' },
    ]);
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;

    // Act : je clique sur « Annuler », le service envoie le PATCH, le "serveur" répond
    $page.querySelector<HTMLButtonElement>('.btn-annuler')?.click();
    serveur
      .expectOne({ method: 'PATCH', url: 'https://127.0.0.1:8000/api/me/reservations/12/annuler' })
      .flush({ message: 'Réservation annulée.', statut: 'annulee' });
    fixture.detectChanges();

    // Assert : le tableau affiche le nouveau statut, sans recharger la page
    expect($page.querySelector('.statut')?.textContent).toContain('Annulée');
    expect($page.querySelector('.btn-annuler')).toBeNull();
  });
});
