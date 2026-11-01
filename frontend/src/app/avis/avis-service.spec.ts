import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AvisService } from './avis-service';

// Règle : une note de 1 à 5 s'affiche avec 5 étoiles (pleines puis vides), la moyenne est arrondie
describe('AvisService', () => {
  let service: AvisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvisService);
  });

  // M : note minimale
  it('shows 1 full star and 4 empty stars for the minimum rating', () => {
    expect( service.etoiles(1) ).toBe('★☆☆☆☆');
  });

  // N : cas normal
  it('shows 3 full stars and 2 empty stars for a rating of 3', () => {
    expect( service.etoiles(3) ).toBe('★★★☆☆');
  });

  // M : note maximale
  it('shows 5 full stars for the maximum rating', () => {
    expect( service.etoiles(5) ).toBe('★★★★★');
  });

  // L : limites de l'arrondi
  it('rounds down an average below x.5 (4.49 → 4 stars)', () => {
    expect( service.etoiles(4.49) ).toBe('★★★★☆');
  });

  it('rounds up an average from x.5 (4.5 → 5 stars)', () => {
    expect( service.etoiles(4.5) ).toBe('★★★★★');
  });

  it('always shows 5 stars in total', () => {
    // Act
    const resultat = service.etoiles(2);

    // Assert
    expect(resultat.length).toBe(5);
  });
});
