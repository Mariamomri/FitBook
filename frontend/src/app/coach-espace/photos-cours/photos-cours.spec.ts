import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PhotosCours } from './photos-cours';
import { CoursService } from '../../cours/cours-service';
import { CoursInterface } from '../../cours/cours-interface';

describe('PhotosCours', () => {
  const coursService = {
    photo: (imageName: string | null | undefined, activite: string | undefined) =>
      imageName ? 'api/images/cours/' + imageName : 'img/' + activite + '.jpg',
    envoyerPhoto: vi.fn(),
  };
  const mesCours: CoursInterface[] = [
    { id: 1, titre: 'Yoga du soir', activiteNom: 'yoga', imageName: null } as CoursInterface,
    { id: 2, titre: 'Boxe', activiteNom: 'boxe', imageName: 'boxe.jpg' } as CoursInterface,
  ];

  function creer() {
    TestBed.configureTestingModule({
      imports: [PhotosCours],
      providers: [{ provide: CoursService, useValue: coursService }],
    });
    const fixture = TestBed.createComponent(PhotosCours);
    fixture.componentRef.setInput('cours', mesCours);
    fixture.detectChanges();
    return fixture;
  }

  // Simule le choix d'un fichier dans l'input
  function evenementFichier(): Event {
    const fichier = new File(['photo'], 'nouvelle.jpg', { type: 'image/jpeg' });
    return { target: { files: [fichier] } } as unknown as Event;
  }

  beforeEach(() => coursService.envoyerPhoto.mockReset());

  it('shows one card per class with the activity photo or the uploaded photo', () => {
    // Act
    const fixture = creer();
    const images = fixture.nativeElement.querySelectorAll('.carte-cours img');

    // Assert
    expect(images.length).toBe(2);
    expect(images[0].getAttribute('src')).toBe('img/yoga.jpg');
    expect(images[1].getAttribute('src')).toBe('api/images/cours/boxe.jpg');
  });

  it('updates the photo and shows a success message after the upload', () => {
    // Arrange
    coursService.envoyerPhoto.mockReturnValue(of({ message: 'Photo enregistrée.', imageName: 'yoga-new.jpg' }));
    const fixture = creer();

    // Act
    fixture.componentInstance.choisirPhoto(mesCours[0], evenementFichier());
    fixture.detectChanges();

    // Assert
    expect(coursService.envoyerPhoto).toHaveBeenCalledWith(1, expect.any(File));
    expect(fixture.componentInstance.liste()[0].photo).toBe('api/images/cours/yoga-new.jpg');
    expect(fixture.nativeElement.querySelector('.alerte-ok').textContent).toContain('Yoga du soir');
  });

  it('shows the API error message when the photo is refused', () => {
    // Arrange
    coursService.envoyerPhoto.mockReturnValue(throwError(() => ({ error: { message: 'Formats acceptés : JPG, PNG ou WEBP.' } })));
    const fixture = creer();

    // Act
    fixture.componentInstance.choisirPhoto(mesCours[0], evenementFichier());
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.querySelector('.alerte').textContent).toContain('Formats acceptés');
  });

  it('shows a message when the coach has no class', () => {
    // Arrange
    TestBed.configureTestingModule({
      imports: [PhotosCours],
      providers: [{ provide: CoursService, useValue: coursService }],
    });
    const fixture = TestBed.createComponent(PhotosCours);

    // Act
    fixture.componentRef.setInput('cours', []);
    fixture.detectChanges();

    // Assert
    expect(fixture.nativeElement.textContent).toContain("Vous n'animez encore aucun cours.");
  });
});
