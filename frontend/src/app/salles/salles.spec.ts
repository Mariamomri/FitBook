import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { type Mocked, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Salles } from './salles';
import { SalleInterface } from './salle-interface';
import { SalleService } from './salle-service';
import { FavoriService } from '../favoris/favori-service';
import { AuthService } from '../auth/auth-service';

// Page « Salles » : liste, filtres, tri, carte, favoris et recherche par distance (formule de Haversine)
// Les services sont remplacés par des mocks : on teste seulement le composant
describe('Salles', () => {
  let component: Salles;
  let fixture: ComponentFixture<Salles>;

  const mockSalleService: Mocked<Pick<SalleService, 'getSalles' | 'photo'>> = {
    getSalles: vi.fn(),
    photo: vi.fn(),
  };
  const mockFavoriService: Mocked<Pick<FavoriService, 'charger' | 'estFavori' | 'basculer'>> = {
    charger: vi.fn(),
    estFavori: vi.fn(),
    basculer: vi.fn(),
  };
  const mockAuthService: Mocked<Pick<AuthService, 'connecte'>> = {
    connecte: vi.fn() as any,
  };

  // Je suis à la Grand-Place de Bruxelles
  const grandPlace = { latitude: 50.8467, longitude: 4.3525 };

  const bruxelles = {
    id: 1, nom: 'Zen Center', description: 'Yoga et pilates', ville: 'Bruxelles', capacite: 50,
    adresse: 'Rue Haute 1', codePostal: '1000', telephone: '02 000 00 00', equipements: 'Tapis',
    latitude: '50.8476', longitude: '4.3499',
  } as SalleInterface;
  const liege = {
    id: 2, nom: 'Fight Club', description: 'Boxe', ville: 'Liège', capacite: 30,
    adresse: 'Rue Neuve 2', codePostal: '4000', telephone: '04 000 00 00',
    latitude: '50.6243', longitude: '5.5668',
  } as SalleInterface;
  const sansCoordonnees = { id: 3, nom: 'Inconnue', description: '', ville: 'Namur', capacite: 10 } as SalleInterface;

  // Remplace la géolocalisation du navigateur par une fausse (aucune vraie position)
  const fausseGeolocalisation = (reponse: 'ok' | 'refus' | 'absente') => {
    const geolocation =
      reponse === 'absente'
        ? undefined
        : {
            getCurrentPosition: (succes: PositionCallback, erreur: PositionErrorCallback) =>
              reponse === 'ok'
                ? succes({ coords: grandPlace } as GeolocationPosition)
                : erreur({} as GeolocationPositionError),
          };
    Object.defineProperty(navigator, 'geolocation', { value: geolocation, configurable: true });
  };

  const $page = (): HTMLElement => fixture.nativeElement;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSalleService.getSalles.mockReturnValue(of({ member: [bruxelles, liege] }));
    mockSalleService.photo.mockReturnValue('img/gym1.jpg');
    mockFavoriService.estFavori.mockReturnValue(false);
    mockAuthService.connecte.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [Salles],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        { provide: SalleService, useValue: mockSalleService },
        { provide: FavoriService, useValue: mockFavoriService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Salles);
    component = fixture.componentInstance;
  });

  afterEach(() => fausseGeolocalisation('absente'));

  describe('list', () => {
    it('loads the gyms and the favourites when the page opens', () => {
      // Act
      fixture.detectChanges();

      // Assert
      expect(mockSalleService.getSalles).toHaveBeenCalled();
      expect(mockFavoriService.charger).toHaveBeenCalled();
      expect($page().querySelectorAll('article.ligne').length).toBe(2);
      expect($page().querySelector('.compteur')?.textContent).toContain('2 salles');
    });

    it('displays "Aucune salle trouvée." when there is no gym', () => {
      // Arrange
      mockSalleService.getSalles.mockReturnValue(of({ member: [] }));

      // Act
      fixture.detectChanges();

      // Assert
      expect($page().textContent).toContain('Aucune salle trouvée.');
    });

    it('filters the list when I type in the search field (upper case ignored)', () => {
      // Arrange
      fixture.detectChanges();
      const $champ = $page().querySelector<HTMLInputElement>('#recherche')!;

      // Act
      $champ.value = 'BOXE';
      $champ.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Assert
      const $noms = Array.from($page().querySelectorAll('article.ligne h3')).map(($h3) => $h3.textContent?.trim());
      expect($noms).toEqual(['Fight Club']);
    });

    it('filters the list by city', () => {
      // Arrange
      fixture.detectChanges();
      const $ville = $page().querySelector<HTMLInputElement>('#ville')!;

      // Act
      $ville.value = 'bruxelles';
      $ville.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Assert
      expect($page().querySelectorAll('article.ligne').length).toBe(1);
    });

    it('sorts by name by default', () => {
      // Act
      fixture.detectChanges();

      // Assert
      expect(component.sallesFiltrees().map((s) => s.nom)).toEqual(['Fight Club', 'Zen Center']);
    });

    it('sorts from the biggest to the smallest capacity when I choose "Capacité"', () => {
      // Arrange
      fixture.detectChanges();
      const $tri = $page().querySelector<HTMLSelectElement>('#tri')!;

      // Act
      $tri.value = 'capacite';
      $tri.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Assert
      expect(component.sallesFiltrees().map((s) => s.capacite)).toEqual([50, 30]);
    });

    it('shows on the map the gym I click', () => {
      // Arrange
      fixture.detectChanges();
      const $lignes = $page().querySelectorAll<HTMLElement>('article.ligne');

      // Act
      $lignes[1].click();
      fixture.detectChanges();

      // Assert
      expect($page().querySelector('.legende')?.textContent).toContain('Zen Center');
      expect($lignes[1].classList).toContain('active');
    });

    it('puts a marker on the map when the gym has coordinates', () => {
      // Act
      fixture.detectChanges();
      const $carte = $page().querySelector('iframe')!;

      // Assert
      expect($carte.getAttribute('src')).toContain('&marker=');
    });

    it('shows Brussels without marker when the gym has no coordinates', () => {
      // Arrange
      mockSalleService.getSalles.mockReturnValue(of({ member: [sansCoordonnees] }));

      // Act
      fixture.detectChanges();
      const $carte = $page().querySelector('iframe')!;

      // Assert
      expect($carte.getAttribute('src')).not.toContain('&marker=');
    });
  });

  describe('favourites', () => {
    it('hides the heart for a visitor who is not logged in', () => {
      // Act
      fixture.detectChanges();

      // Assert
      expect($page().querySelector('.coeur')).toBeNull();
    });

    it('adds the gym to my favourites when I click the heart, without changing the map', () => {
      // Arrange
      mockAuthService.connecte.mockReturnValue(true);
      fixture.detectChanges();

      // Act
      $page().querySelector<HTMLButtonElement>('.coeur')!.click();
      fixture.detectChanges();

      // Assert
      expect(mockFavoriService.basculer).toHaveBeenCalledWith('favoriSalles', '/api/salles/2');
      expect(component.salleChoisie()).toBeNull(); // stopPropagation : la carte ne change pas
    });

    it('shows a full heart for a gym already in my favourites', () => {
      // Arrange
      mockAuthService.connecte.mockReturnValue(true);
      mockFavoriService.estFavori.mockReturnValue(true);

      // Act
      fixture.detectChanges();

      // Assert
      expect($page().querySelector('.coeur')?.textContent).toContain('♥');
    });
  });

  describe('distance', () => {
    it('finds my position, sorts by distance and shows the radius list when I click "Près de moi"', () => {
      // Arrange
      fausseGeolocalisation('ok');
      fixture.detectChanges();

      // Act
      $page().querySelector<HTMLButtonElement>('.pres-de-moi')!.click();
      fixture.detectChanges();

      // Assert
      expect(component.maPosition()).toEqual(grandPlace);
      expect(component.tri()).toBe('distance');
      expect(component.sallesFiltrees().map((s) => s.nom)).toEqual(['Zen Center', 'Fight Club']);
      expect($page().querySelector('#rayon')).not.toBeNull();
      expect($page().querySelector('.distance')?.textContent).toContain('208 m');
    });

    it('shows a message when I refuse to share my position', () => {
      // Arrange
      fausseGeolocalisation('refus');
      fixture.detectChanges();

      // Act
      $page().querySelector<HTMLButtonElement>('.pres-de-moi')!.click();
      fixture.detectChanges();

      // Assert
      expect($page().querySelector('.message-position')?.textContent).toContain('Position refusée');
    });

    it('shows a message when the browser has no geolocation', () => {
      // Arrange
      fausseGeolocalisation('absente');
      fixture.detectChanges();

      // Act
      component.localiser();

      // Assert
      expect(component.messagePosition()).toContain('ne permet pas la géolocalisation');
    });

    it('keeps only the gyms inside the radius I choose', () => {
      // Arrange
      fausseGeolocalisation('ok');
      fixture.detectChanges();
      component.localiser();
      fixture.detectChanges();
      const $rayon = $page().querySelector<HTMLSelectElement>('#rayon')!;

      // Act
      $rayon.value = '5';
      $rayon.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      // Assert
      expect(component.sallesFiltrees().map((s) => s.nom)).toEqual(['Zen Center']);
    });

    it('calculates about 89 km between the Grand-Place and Liège', () => {
      // Arrange
      component.maPosition.set(grandPlace);

      // Assert : toBeCloseTo car un calcul avec des décimales n'est jamais exact
      expect( component.distance(liege) ).toBeCloseTo(89, 0);
    });

    it('returns no distance for a gym without coordinates', () => {
      // Arrange
      component.maPosition.set(grandPlace);

      // Assert
      expect( component.distance(sansCoordonnees) ).toBeNull();
      expect( component.texteDistance(sansCoordonnees) ).toBe('');
    });

    it('returns no distance before I click "Près de moi"', () => {
      expect( component.distance(bruxelles) ).toBeNull();
    });

    it('shows the distance in km with a comma from 1 km', () => {
      // Arrange
      component.maPosition.set(grandPlace);

      // Assert
      expect( component.texteDistance(liege) ).toBe('89,0 km');
    });

    it('keeps every gym when the radius is 0 ("Toutes les distances")', () => {
      // Arrange
      component.maPosition.set(grandPlace);
      component.rayon.set(0);

      // Assert
      expect( component.dansLeRayon(liege) ).toBe(true);
    });
  });
});
