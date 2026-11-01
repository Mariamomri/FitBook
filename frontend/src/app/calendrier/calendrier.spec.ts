import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

import { Calendrier } from './calendrier';
import { ReservationService } from '../reservations/reservation-service';

registerLocaleData(localeFr); // le calendrier affiche les dates en français, comme dans app.config.ts

describe('Calendrier', () => {
  let component: Calendrier;
  let fixture: ComponentFixture<Calendrier>;

  // Le calendrier dépend de ReservationService : on contrôle les réservations reçues
  const mockReservationService: Mocked<Pick<ReservationService, 'getMesReservations'>> = {
    getMesReservations: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockReservationService.getMesReservations.mockReturnValue(
      of([
        { id: 1, numero: 'FB-1', statut: 'confirmee', cours: 'Yoga', salle: 'Zen', dateDebut: '15/10/2026 18:00', dateFin: '15/10/2026 19:00' },
        { id: 2, numero: 'FB-2', statut: 'annulee', cours: 'Boxe', salle: 'Fight', dateDebut: '16/10/2026 10:00', dateFin: '16/10/2026 11:00' },
      ]),
    );
    await TestBed.configureTestingModule({
      imports: [Calendrier],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ReservationService, useValue: mockReservationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Calendrier);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('recognises a booking that falls on the right day', () => {
    // mois = 9 car pour JavaScript janvier = 0, donc octobre = 9
    expect( component.memeJour('30/10/2026 18:00', 30, 9, 2026) ).toBe(true);
  });

  it('does not mix up the same day of another month', () => {
    expect( component.memeJour('30/10/2026 18:00', 30, 10, 2026) ).toBe(false);
  });

  it('keeps only the time of "30/10/2026 18:00"', () => {
    expect( component.heure('30/10/2026 18:00') ).toBe('18:00');
  });

  it('starts the grid on Monday: October 2026 begins with 3 empty boxes (1st = Thursday)', () => {
    // Arrange
    component.moisAffiche.set(new Date(2026, 9, 1));

    // Act
    const cases = component.cases();

    // Assert
    expect(cases.filter((c) => c.jour === null).length).toBe(3);
    expect(cases.filter((c) => c.jour !== null).length).toBe(31);
  });

  it('goes from December to January of the next year', () => {
    // Arrange
    component.moisAffiche.set(new Date(2026, 11, 1));

    // Act
    component.moisSuivant();

    // Assert
    expect(component.moisAffiche().getMonth()).toBe(0);
    expect(component.moisAffiche().getFullYear()).toBe(2027);
  });

  it('goes from January back to December of the previous year', () => {
    // Arrange
    component.moisAffiche.set(new Date(2027, 0, 1));

    // Act
    component.moisPrecedent();

    // Assert
    expect(component.moisAffiche().getMonth()).toBe(11);
    expect(component.moisAffiche().getFullYear()).toBe(2026);
  });

  it('shows my confirmed session in the right box, but not the cancelled one', () => {
    // Arrange
    component.moisAffiche.set(new Date(2026, 9, 1));

    // Act
    fixture.detectChanges();
    const $seances = (fixture.nativeElement as HTMLElement).querySelectorAll('.seance');

    // Assert
    expect($seances.length).toBe(1);
    expect($seances[0].textContent).toContain('18:00 Yoga');
  });

  it('shows the next month when I click the right arrow', () => {
    // Arrange
    component.moisAffiche.set(new Date(2026, 9, 1));
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;

    // Act
    $page.querySelector<HTMLButtonElement>('[aria-label="Mois suivant"]')!.click();
    fixture.detectChanges();

    // Assert
    expect($page.querySelector('.titre-mois')?.textContent).toContain('novembre 2026');
  });

  it('shows the previous month when I click the left arrow', () => {
    // Arrange
    component.moisAffiche.set(new Date(2026, 9, 1));
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;

    // Act
    $page.querySelector<HTMLButtonElement>('[aria-label="Mois précédent"]')!.click();
    fixture.detectChanges();

    // Assert
    expect($page.querySelector('.titre-mois')?.textContent).toContain('septembre 2026');
  });

  it('highlights today only in the current month', () => {
    // Arrange
    const aujourdhui = new Date();

    // Assert
    expect( component.estAujourdhui(aujourdhui.getDate()) ).toBe(true);
    expect( component.estAujourdhui(null) ).toBe(false);
  });

  it('hides the banner when the calendar is shown inside the dashboard', () => {
    // Act : <app-calendrier [bandeau]="false" />
    fixture.componentRef.setInput('bandeau', false);
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;

    // Assert
    expect($page.querySelector('.bandeau')).toBeNull();
    expect($page.querySelector('.calendrier.compact')).not.toBeNull();
  });
});
