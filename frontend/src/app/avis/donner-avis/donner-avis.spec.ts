import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

import { DonnerAvis } from './donner-avis';
import { AvisService } from '../avis-service';
import { AvisInterface } from '../avis-interface';
import { AuthService } from '../../auth/auth-service';
import { ReservationService } from '../../reservations/reservation-service';
import { ReservationInterface } from '../../reservations/reservation-interface';

// Avis sur une salle : règle métier = on peut noter une salle après y avoir participé à une séance
// Les services sont remplacés par des mocks : on contrôle les avis et les réservations reçus
describe('DonnerAvis', () => {
  let component: DonnerAvis;
  let fixture: ComponentFixture<DonnerAvis>;

  const mockAvisService: Mocked<Pick<AvisService, 'getAvis' | 'etoiles' | 'creerAvis' | 'modifierAvis' | 'supprimerAvis'>> = {
    getAvis: vi.fn(),
    etoiles: vi.fn(),
    creerAvis: vi.fn(),
    modifierAvis: vi.fn(),
    supprimerAvis: vi.fn(),
  };
  const mockAuthService: Mocked<Pick<AuthService, 'connecte'>> = {
    connecte: vi.fn() as any,
  };
  const mockReservationService: Mocked<Pick<ReservationService, 'getMesReservations' | 'versDate'>> = {
    getMesReservations: vi.fn(),
    versDate: vi.fn(),
  };

  // Trois avis publiés sur la salle 1 (notes 5, 4, 4), un avis en attente et un avis sur une autre salle
  const avisDesAutres = [
    { id: 1, note: 5, commentaire: 'Top', statut: 'publie', reservation: '/api/reservations/1', salle: '/api/salles/1', auteur: 'Mariam O.', createdAt: '2026-10-01' },
    { id: 2, note: 4, commentaire: 'Bien', statut: 'publie', reservation: '/api/reservations/2', salle: '/api/salles/1', auteur: 'Léa D.', auteurImage: 'lea.jpg', createdAt: '2026-10-03' },
    { id: 3, note: 4, commentaire: 'Sympa', statut: 'publie', reservation: '/api/reservations/3', salle: '/api/salles/1', createdAt: '2026-10-02' },
    { id: 4, note: 1, commentaire: 'Bof', statut: 'en_attente', reservation: '/api/reservations/4', salle: '/api/salles/1' },
    { id: 5, note: 3, commentaire: 'Autre', statut: 'publie', reservation: '/api/reservations/5', salle: '/api/salles/2' },
  ] as AvisInterface[];

  // Ma réservation passée dans la salle 1 (id 20) → je peux donner un avis
  const maReservation: ReservationInterface = {
    id: 20, numero: 'FB-2026-000020', statut: 'confirmee', cours: 'Yoga', salle: 'Zen', salleId: 1,
    dateDebut: '01/10/2026 18:00', dateFin: '01/10/2026 19:00',
  };
  const monAvis = { id: 9, note: 2, commentaire: 'Trop de monde', statut: 'refuse', reservation: '/api/reservations/20', salle: '/api/salles/1', createdAt: '2026-10-10' } as AvisInterface;

  const $page = (): HTMLElement => fixture.nativeElement;

  const creer = async (avis: AvisInterface[], connecte: boolean, reservations: ReservationInterface[] = []) => {
    mockAvisService.getAvis.mockReturnValue(of({ member: avis }));
    mockAuthService.connecte.mockReturnValue(connecte);
    mockReservationService.getMesReservations.mockReturnValue(of(reservations));
    fixture = TestBed.createComponent(DonnerAvis);
    component = fixture.componentInstance;
    // Les input() se remplissent avec setInput, comme <app-donner-avis cible="salle" lien="/api/salles/1">
    fixture.componentRef.setInput('cible', 'salle');
    fixture.componentRef.setInput('lien', '/api/salles/1');
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockAvisService.etoiles.mockReturnValue('★★★★☆');
    // Même conversion que le vrai service : "01/10/2026 18:00" → date
    mockReservationService.versDate.mockImplementation((texte: string) => {
      const [jour, heure] = texte.split(' ');
      const [j, m, a] = jour.split('/').map(Number);
      const [h, min] = heure.split(':').map(Number);
      return new Date(a, m - 1, j, h, min);
    });

    await TestBed.configureTestingModule({
      imports: [DonnerAvis],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AvisService, useValue: mockAvisService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ReservationService, useValue: mockReservationService },
      ],
    }).compileComponents();
  });

  describe('visitor', () => {
    beforeEach(async () => creer(avisDesAutres, false));

    it('counts only the published reviews of this gym', () => {
      expect( component.avisPublies().length ).toBe(3);
      expect($page().querySelector('h2')?.textContent).toContain('Avis (3)');
    });

    it('calculates the average with one decimal (5 + 4 + 4 → 4.3)', () => {
      expect( component.noteMoyenne() ).toBe(4.3);
    });

    it('calculates the share of each rating for the bars (2 reviews out of 3 → about 66.7 %)', () => {
      expect( component.partNote(4) ).toBeCloseTo(66.7, 1);
    });

    it('shows "Connectez-vous" and no form', () => {
      expect($page().textContent).toContain('Connectez-vous');
      expect($page().querySelector('form')).toBeNull();
      expect(mockReservationService.getMesReservations).not.toHaveBeenCalled();
    });

    it('shows the 3 most recent reviews first, then all of them with "Voir tous les avis"', async () => {
      // Arrange : 4 avis publiés → le bouton apparaît
      await creer([...avisDesAutres, { id: 6, note: 5, commentaire: 'Génial', statut: 'publie', reservation: '/api/reservations/6', salle: '/api/salles/1', createdAt: '2026-10-04' } as AvisInterface], false);
      expect($page().querySelectorAll('.avis').length).toBe(3);
      expect($page().querySelector('.avis .commentaire')?.textContent).toContain('Génial'); // le plus récent d'abord

      // Act
      $page().querySelector<HTMLButtonElement>('.voir-tout')!.click();
      fixture.detectChanges();

      // Assert
      expect($page().querySelectorAll('.avis').length).toBe(4);
      expect($page().querySelector('.voir-tout')?.textContent).toContain('Voir moins');
    });

    it('shows the photo of the author, or his initials', () => {
      expect($page().querySelector('img.avatar')).not.toBeNull();
      const $initiales = Array.from($page().querySelectorAll('.initiales')).map(($span) => $span.textContent?.trim());
      expect($initiales).toContain('MO');
    });

    it('turns "Mariam O." into "MO" and shows "?" without a name', () => {
      expect( component.initiales('Mariam O.') ).toBe('MO');
      expect( component.initiales(undefined) ).toBe('?');
    });

    it('shows "Pas encore d\'avis." and an average of 0 when there is no review', async () => {
      // Act
      await creer([], false);

      // Assert
      expect($page().textContent).toContain("Pas encore d'avis.");
      expect( component.noteMoyenne() ).toBe(0);
      expect( component.partNote(5) ).toBe(0);
    });
  });

  describe('logged-in sportif', () => {
    it('says I can give my opinion after a session when I have no booking here', async () => {
      // Act
      await creer(avisDesAutres, true, []);

      // Assert
      expect($page().textContent).toContain('après avoir participé à une séance');
    });

    it('does not let me review a future session', async () => {
      // Arrange : séance en 2030, donc pas encore passée
      await creer(avisDesAutres, true, [{ ...maReservation, dateDebut: '01/10/2030 18:00' }]);

      // Assert
      expect( component.reservationLibre() ).toBeUndefined();
    });

    it('shows the form after a past session in this gym', async () => {
      // Act
      await creer(avisDesAutres, true, [maReservation]);

      // Assert
      expect($page().querySelector('form')).not.toBeNull();
      expect($page().textContent).toContain('Participation vérifiée');
    });

    it('chooses the rating when I click a star', async () => {
      // Arrange
      await creer(avisDesAutres, true, [maReservation]);

      // Act : clic sur la 3e étoile
      $page().querySelectorAll<HTMLButtonElement>('.etoiles-choix button')[2].click();
      fixture.detectChanges();

      // Assert
      expect(component.note()).toBe(3);
      expect($page().querySelectorAll('.etoiles-choix .allumee').length).toBe(3);
    });

    it('shows an error under the comment and sends nothing when the comment is too short', async () => {
      // Arrange
      await creer(avisDesAutres, true, [maReservation]);
      component.avisForm.setValue({ commentaire: 'ok' }); // 2 caractères

      // Act
      $page().querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
      fixture.detectChanges();

      // Assert
      expect($page().querySelector('.erreur-champ')?.textContent).toContain('3 caractères minimum');
      expect(mockAvisService.creerAvis).not.toHaveBeenCalled();
    });

    it('sends a new review "en attente" linked to my booking', async () => {
      // Arrange
      mockAvisService.creerAvis.mockReturnValue(of({} as AvisInterface));
      await creer(avisDesAutres, true, [maReservation]);
      component.note.set(4);
      component.avisForm.setValue({ commentaire: '  Super salle  ' });

      // Act
      component.envoyer();
      fixture.detectChanges();

      // Assert
      expect(mockAvisService.creerAvis).toHaveBeenCalledWith({
        note: 4, commentaire: 'Super salle', statut: 'en_attente', reservation: '/api/reservations/20', salle: '/api/salles/1',
      });
      expect($page().querySelector('.alerte-ok')?.textContent).toContain('visible après validation');
      expect(component.note()).toBe(5); // le formulaire est remis à zéro
    });

    it('shows the message of Symfony when the review is refused', async () => {
      // Arrange
      mockAvisService.creerAvis.mockReturnValue(throwError(() => ({ status: 403, error: { detail: 'Confirmez votre email.' } })));
      await creer(avisDesAutres, true, [maReservation]);
      component.avisForm.setValue({ commentaire: 'Super salle' });

      // Act
      component.envoyer();
      fixture.detectChanges();

      // Assert
      expect($page().querySelector('.alerte')?.textContent).toContain('Confirmez votre email.');
    });

    it('shows my refused review with its status and my buttons, even if it is not published', async () => {
      // Act
      await creer([...avisDesAutres, monAvis], true, [maReservation]);

      // Assert
      expect($page().querySelector('.badge')?.textContent).toContain('Votre avis');
      expect($page().querySelector('.statut.refuse')?.textContent).toContain('Refusé');
      expect($page().textContent).toContain('vous avez déjà donné votre avis');
      expect( component.libelleStatut('en_attente') ).toBe('En attente de validation');
    });

    it('fills the form when I click "Modifier", then saves my changes', async () => {
      // Arrange
      mockAvisService.modifierAvis.mockReturnValue(of({} as AvisInterface));
      await creer([...avisDesAutres, monAvis], true, [maReservation]);
      const $modifier = Array.from($page().querySelectorAll<HTMLButtonElement>('.actions button')).find(($b) => $b.textContent?.includes('Modifier'))!;

      // Act 1 : clic sur « Modifier »
      $modifier.click();
      fixture.detectChanges();

      // Assert 1
      expect($page().querySelector('h3')?.textContent).toContain('Modifier mon avis');
      expect(component.avisForm.value.commentaire).toBe('Trop de monde');
      expect(component.note()).toBe(2);

      // Act 2 : j'enregistre
      component.avisForm.setValue({ commentaire: 'Mieux le matin' });
      component.envoyer();
      fixture.detectChanges();

      // Assert 2
      expect(mockAvisService.modifierAvis).toHaveBeenCalledWith(9, { note: 2, commentaire: 'Mieux le matin' });
      expect($page().querySelector('.alerte-ok')?.textContent).toContain('Avis modifié.');
    });

    it('leaves the edit mode when I click "Annuler"', async () => {
      // Arrange
      await creer([...avisDesAutres, monAvis], true, [maReservation]);
      component.modifier(monAvis);
      fixture.detectChanges();

      // Act
      Array.from($page().querySelectorAll<HTMLButtonElement>('.boutons button')).find(($b) => $b.textContent?.includes('Annuler'))!.click();
      fixture.detectChanges();

      // Assert
      expect(component.idEnModification()).toBeNull();
    });

    it('shows the error of Symfony when the edit fails', async () => {
      // Arrange
      mockAvisService.modifierAvis.mockReturnValue(throwError(() => ({ status: 422, error: {} })));
      await creer([...avisDesAutres, monAvis], true, [maReservation]);
      component.modifier(monAvis);

      // Act
      component.envoyer();

      // Assert
      expect(component.erreur()).toBe("Impossible de modifier l'avis.");
    });

    it('asks for a confirmation, then deletes my review when I click "Oui"', async () => {
      // Arrange
      mockAvisService.supprimerAvis.mockReturnValue(of(undefined));
      await creer([...avisDesAutres, monAvis], true, [maReservation]);
      const $boutons = () => Array.from($page().querySelectorAll<HTMLButtonElement>('.actions button'));

      // Act 1 : « Supprimer » demande une confirmation
      $boutons().find(($b) => $b.textContent?.includes('Supprimer'))!.click();
      fixture.detectChanges();
      expect($page().textContent).toContain('Supprimer ?');

      // Act 2 : « Oui »
      $boutons().find(($b) => $b.textContent?.includes('Oui'))!.click();
      fixture.detectChanges();

      // Assert
      expect(mockAvisService.supprimerAvis).toHaveBeenCalledWith(9);
      expect($page().querySelector('.badge')).toBeNull();
      expect($page().querySelector('.alerte-ok')?.textContent).toContain('Avis supprimé.');
    });

    it('keeps my review when I click "Non"', async () => {
      // Arrange
      await creer([...avisDesAutres, monAvis], true, [maReservation]);
      component.idASupprimer.set(9);
      fixture.detectChanges();

      // Act
      Array.from($page().querySelectorAll<HTMLButtonElement>('.actions button')).find(($b) => $b.textContent?.includes('Non'))!.click();
      fixture.detectChanges();

      // Assert
      expect(component.idASupprimer()).toBeNull();
      expect(mockAvisService.supprimerAvis).not.toHaveBeenCalled();
    });

    it('shows an error when the deletion fails', async () => {
      // Arrange
      mockAvisService.supprimerAvis.mockReturnValue(throwError(() => ({ status: 500, error: {} })));
      await creer([...avisDesAutres, monAvis], true, [maReservation]);

      // Act
      component.supprimer(monAvis);

      // Assert
      expect(component.erreur()).toBe("Impossible de supprimer l'avis.");
    });
  });
});
