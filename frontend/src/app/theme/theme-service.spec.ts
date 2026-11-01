import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { ThemeService } from './theme-service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear(); // chaque test part d'un navigateur vide (tests indépendants)
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('changes the colour of the whole site and keeps it in the browser', () => {
    // Act
    service.appliquer('orange');

    // Assert
    expect(document.documentElement.dataset['accent']).toBe('orange');
    expect(localStorage.getItem('couleur')).toBe('orange');
  });

  it('restores the colour saved in the browser', () => {
    // Arrange
    localStorage.setItem('couleur', 'rose');

    // Act
    service.restaurer();

    // Assert
    expect(document.documentElement.dataset['accent']).toBe('rose');
  });

  it('uses green when no colour is saved', () => {
    // Act
    service.restaurer();

    // Assert
    expect(document.documentElement.dataset['accent']).toBe('vert');
  });

  it('offers 6 colours including green', () => {
    // Act
    const noms = service.couleurs.map((c) => c.nom);

    // Assert
    expect(noms.length).toBe(6);
    expect(noms).toContain('vert');
  });
});
