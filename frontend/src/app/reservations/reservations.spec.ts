import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

import { Reservations } from './reservations';
import { ReservationService } from './reservation-service';
import { ReservationInterface } from './reservation-interface';

// Test de composant : le service est remplacé par un mock, on contrôle sa réponse scénario par scénario
// Trois scénarios : succès (liste affichée), succès mais vide (message), erreur (message d'erreur)
describe('Reservations', () => {
  let fixture: ComponentFixture<Reservations>;

  const mockReservationService: Mocked<Pick<ReservationService, 'getMesReservations' | 'annuler' | 'qrCode'>> = {
    getMesReservations: vi.fn(),
    annuler: vi.fn(),
    qrCode: vi.fn(),
  };

  const yoga: ReservationInterface = {
    id: 12, numero: 'FB-2026-000012', statut: 'confirmee', cours: 'Yoga', salle: 'Zen Center',
    dateDebut: '30/11/2026 18:00', dateFin: '30/11/2026 19:00',
  };
  const boxe: ReservationInterface = {
    id: 13, numero: 'FB-2026-000013', statut: 'annulee', cours: 'Boxe', salle: 'Fight Club',
    dateDebut: '01/12/2026 10:00', dateFin: '01/12/2026 11:00',
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [Reservations],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReservationService, useValue: mockReservationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Reservations);
  });

  it('displays the bookings returned by the service', () => {
    // Arrange
    mockReservationService.getMesReservations.mockReturnValue(of([yoga, boxe]));

    // Act
    fixture.detectChanges(); // lance ngOnInit et met à jour le HTML
    const $page: HTMLElement = fixture.nativeElement;
    const $lignes = $page.querySelectorAll('tbody tr');

    // Assert
    expect(mockReservationService.getMesReservations).toHaveBeenCalled();
    expect($lignes.length).toBe(2);
    expect($lignes[0].textContent).toContain('Yoga');
  });

  it('displays an empty state when the user has no booking', () => {
    // Arrange
    mockReservationService.getMesReservations.mockReturnValue(of([]));

    // Act
    fixture.detectChanges();
    const $vide = (fixture.nativeElement as HTMLElement).querySelector('.vide');

    // Assert
    expect($vide?.textContent).toContain('Aucune réservation pour le moment.');
  });

  it('displays an error when the bookings cannot be loaded', () => {
    // Arrange
    mockReservationService.getMesReservations.mockReturnValue(throwError(() => new Error('500')));

    // Act
    fixture.detectChanges();
    const $erreur = (fixture.nativeElement as HTMLElement).querySelector('.alerte');

    // Assert
    expect($erreur?.textContent).toContain('Impossible de charger vos réservations');
  });

  it('shows the "Annuler" button only for a confirmed booking', () => {
    // Arrange
    mockReservationService.getMesReservations.mockReturnValue(of([yoga, boxe]));

    // Act
    fixture.detectChanges();
    const $lignes = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');

    // Assert
    expect($lignes[0].querySelector('.btn-annuler')).not.toBeNull(); // confirmée
    expect($lignes[1].querySelector('.btn-annuler')).toBeNull(); // annulée
  });

  it('cancels the booking when I click "Annuler" and shows the new status', () => {
    // Arrange
    mockReservationService.getMesReservations.mockReturnValue(of([yoga]));
    mockReservationService.annuler.mockReturnValue(of({ message: 'Réservation annulée.', statut: 'annulee' }));
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;

    // Act
    $page.querySelector<HTMLButtonElement>('.btn-annuler')?.click();
    fixture.detectChanges();

    // Assert
    expect(mockReservationService.annuler).toHaveBeenCalledWith(12);
    expect($page.querySelector('.statut')?.textContent).toContain('Annulée');
    expect($page.querySelector('.alerte-ok')?.textContent).toContain('Réservation annulée.');
  });

  it('shows the message sent by Symfony when the cancellation is refused', () => {
    // Arrange
    mockReservationService.getMesReservations.mockReturnValue(of([yoga]));
    mockReservationService.annuler.mockReturnValue(
      throwError(() => ({ status: 422, error: { message: 'La séance a déjà commencé.' } })),
    );
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;

    // Act
    $page.querySelector<HTMLButtonElement>('.btn-annuler')?.click();
    fixture.detectChanges();

    // Assert
    expect($page.querySelector('.alerte')?.textContent).toContain('La séance a déjà commencé.');
  });

  it('opens the QR code window when I click "QR", and closes it with "Fermer"', async () => {
    // Arrange
    mockReservationService.getMesReservations.mockReturnValue(of([yoga]));
    mockReservationService.qrCode.mockResolvedValue('data:image/png;base64,AAA');
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;

    // Act : ouvrir (qrCode renvoie une Promise : on attend avec whenStable)
    $page.querySelector<HTMLButtonElement>('.btn-qr')!.click();
    await fixture.whenStable();
    fixture.detectChanges();

    // Assert
    expect(mockReservationService.qrCode).toHaveBeenCalledWith('FB-2026-000012');
    expect($page.querySelector('.fenetre-qr h3')?.textContent).toContain('FB-2026-000012');

    // Act : un clic dans la fenêtre ne la ferme pas, « Fermer » la ferme
    $page.querySelector<HTMLElement>('.fenetre-qr')!.click();
    fixture.detectChanges();
    expect($page.querySelector('.fenetre-qr')).not.toBeNull();
    $page.querySelector<HTMLButtonElement>('.fenetre-qr button')!.click();
    fixture.detectChanges();

    // Assert
    expect($page.querySelector('.fenetre-qr')).toBeNull();
  });

  it('closes the QR code window when I click outside', () => {
    // Arrange
    mockReservationService.getMesReservations.mockReturnValue(of([yoga]));
    fixture.detectChanges();
    fixture.componentInstance.qrOuvert.set({ numero: 'FB-2026-000012', image: 'data:image/png;base64,AAA' });
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;

    // Act
    $page.querySelector<HTMLElement>('.fond-qr')!.click();
    fixture.detectChanges();

    // Assert
    expect($page.querySelector('.fond-qr')).toBeNull();
  });
});
