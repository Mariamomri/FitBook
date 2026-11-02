import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

import { NouveauMotDePasse } from './nouveau-mot-de-passe';
import { AuthService } from '../auth-service';

// Règle : au moins 8 caractères, dont 1 majuscule et 1 chiffre, et les deux champs identiques
describe('NouveauMotDePasse', () => {
  let component: NouveauMotDePasse;
  let fixture: ComponentFixture<NouveauMotDePasse>;

  const mockAuthService: Mocked<Pick<AuthService, 'nouveauMotDePasse'>> = {
    nouveauMotDePasse: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [NouveauMotDePasse],
      providers: [provideRouter([]), { provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(NouveauMotDePasse);
    component = fixture.componentInstance;
    // Pas de rendu ici : chaque test choisit d'abord s'il y a un token dans le lien, puis affiche la page
  });

  // L : valeurs limites (7, 8 caractères)
  it('rejects a password of 7 characters', () => {
    // Act
    component.motDePasseForm.controls.password.setValue('Fitboo1');

    // Assert
    expect(component.motDePasseForm.controls.password.valid).toBeFalsy();
  });

  it('accepts a password of exactly 8 characters', () => {
    // Act
    component.motDePasseForm.controls.password.setValue('Fitbook1');

    // Assert
    expect(component.motDePasseForm.controls.password.valid).toBe(true);
  });

  // A : cas anormaux
  it('rejects a password without an upper-case letter', () => {
    // Act
    component.motDePasseForm.controls.password.setValue('fitbook2026');

    // Assert
    expect(component.motDePasseForm.controls.password.valid).toBeFalsy();
  });

  it('rejects a password without a digit', () => {
    // Act
    component.motDePasseForm.controls.password.setValue('Fitbookfit');

    // Assert
    expect(component.motDePasseForm.controls.password.valid).toBeFalsy();
  });

  // E : erreur possible
  it('reports an error when the two passwords are different', () => {
    // Act
    component.motDePasseForm.setValue({ password: 'Fitbook2026', confirmation: 'Fitbook2027' });

    // Assert
    expect(component.motDePasseForm.hasError('differents')).toBe(true);
  });

  // N : cas normal
  it('accepts the form when everything is correct', () => {
    // Act
    component.motDePasseForm.setValue({ password: 'Fitbook2026', confirmation: 'Fitbook2026' });

    // Assert
    expect(component.motDePasseForm.valid).toBe(true);
  });

  it('lights no segment of the strength bar for a weak password', () => {
    // Act
    component.saisie.set('abc');

    // Assert
    expect(component.force()).toBe(0);
  });

  it('lights 3 segments for 8 characters with an upper-case letter and a digit', () => {
    // Act
    component.saisie.set('Fitbook1');

    // Assert
    expect(component.force()).toBe(3);
  });

  it('lights the 4 segments from 12 characters', () => {
    // Act
    component.saisie.set('Fitbook12345');

    // Assert
    expect(component.force()).toBe(4);
  });

  // Tests dans le DOM : la page dépend du token reçu dans le lien de l'email
  it('shows "Ce lien est incomplet" when the link has no token', () => {
    // Act
    fixture.detectChanges();

    // Assert
    expect((fixture.nativeElement as HTMLElement).querySelector('.alerte')?.textContent).toContain('Ce lien est incomplet');
  });

  it('shows the messages under the fields and does not call Symfony when I send a weak password', () => {
    // Arrange
    component.token = 'abc';
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;
    component.motDePasseForm.setValue({ password: 'abc', confirmation: 'abd' });

    // Act
    $page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();

    // Assert
    expect($page.textContent).toContain('8 caractères minimum, avec 1 majuscule et 1 chiffre');
    expect($page.textContent).toContain('Les mots de passe ne correspondent pas');
    expect(mockAuthService.nouveauMotDePasse).not.toHaveBeenCalled();
  });

  it('lights the segments of the strength bar while I type', () => {
    // Arrange
    component.token = 'abc';
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;
    const $champ = $page.querySelector<HTMLInputElement>('#password')!;

    // Act
    $champ.value = 'Fitbook1';
    $champ.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Assert
    expect($page.querySelectorAll('.force .allume').length).toBe(3);
  });

  it('saves the new password and shows the message of Symfony', () => {
    // Arrange
    mockAuthService.nouveauMotDePasse.mockReturnValue(of({ message: 'Mot de passe modifié.' }));
    component.token = 'abc';
    fixture.detectChanges();
    component.motDePasseForm.setValue({ password: 'Fitbook2026', confirmation: 'Fitbook2026' });

    // Act
    component.enregistrer();
    fixture.detectChanges();

    // Assert
    expect(mockAuthService.nouveauMotDePasse).toHaveBeenCalledWith('abc', 'Fitbook2026');
    expect((fixture.nativeElement as HTMLElement).querySelector('.alerte-ok')?.textContent).toContain('Mot de passe modifié.');
  });

  it('shows the message of Symfony when the link has expired', () => {
    // Arrange
    mockAuthService.nouveauMotDePasse.mockReturnValue(
      throwError(() => ({ status: 400, error: { message: 'Lien expiré ou déjà utilisé.' } })),
    );
    component.token = 'abc';
    fixture.detectChanges();
    component.motDePasseForm.setValue({ password: 'Fitbook2026', confirmation: 'Fitbook2026' });

    // Act
    component.enregistrer();
    fixture.detectChanges();

    // Assert
    expect((fixture.nativeElement as HTMLElement).querySelector('.alerte')?.textContent).toContain('Lien expiré ou déjà utilisé.');
  });

  it('shows "Erreur serveur" when Symfony sends no message', () => {
    // Arrange
    mockAuthService.nouveauMotDePasse.mockReturnValue(throwError(() => ({ status: 500 })));
    component.token = 'abc';
    component.motDePasseForm.setValue({ password: 'Fitbook2026', confirmation: 'Fitbook2026' });

    // Act
    component.enregistrer();

    // Assert
    expect(component.erreur()).toBe('Erreur serveur, réessayez plus tard.');
  });
});
