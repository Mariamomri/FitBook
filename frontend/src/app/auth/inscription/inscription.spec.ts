import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

import { Inscription } from './inscription';
import { AuthService } from '../auth-service';

// Règles du formulaire (les mêmes que les Assert de l'entité User) :
// prénom de 2 à 50 caractères, email valide, mot de passe de 6 caractères minimum,
// confirmation identique et conditions d'utilisation acceptées
describe('Inscription', () => {
  let component: Inscription;
  let fixture: ComponentFixture<Inscription>;

  const mockAuthService: Mocked<Pick<AuthService, 'inscription'>> = {
    inscription: vi.fn(),
  };

  // Un formulaire correct, que chaque test modifie sur un seul champ
  const formulaireValide = {
    firstname: 'Léa',
    lastname: 'Dupont',
    email: 'lea@fitbook.be',
    plainPassword: 'Secret1',
    confirmation: 'Secret1',
    accentColor: 'vert',
    cgu: true,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [Inscription],
      providers: [provideRouter([{ path: '**', children: [] }]), { provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Inscription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // N : cas normal
  it('accepts a correctly filled form', () => {
    // Act
    component.inscriptionForm.setValue(formulaireValide);

    // Assert
    expect(component.inscriptionForm.valid).toBe(true);
  });

  // O : valeur oubliée
  it('rejects the form when the first name is empty', () => {
    // Act
    component.inscriptionForm.setValue({ ...formulaireValide, firstname: '' });

    // Assert
    expect(component.inscriptionForm.controls.firstname.hasError('required')).toBe(true);
  });

  // M / L : limite minimale du prénom (1 refusé, 2 accepté)
  it('rejects a first name of 1 character', () => {
    // Act
    component.inscriptionForm.setValue({ ...formulaireValide, firstname: 'L' });

    // Assert
    expect(component.inscriptionForm.controls.firstname.valid).toBeFalsy();
  });

  it('accepts a first name of exactly 2 characters', () => {
    // Act
    component.inscriptionForm.setValue({ ...formulaireValide, firstname: 'Lé' });

    // Assert
    expect(component.inscriptionForm.controls.firstname.valid).toBe(true);
  });

  // M / L : limite maximale du prénom (50 accepté, 51 refusé)
  it('accepts a first name of exactly 50 characters', () => {
    // Act
    component.inscriptionForm.setValue({ ...formulaireValide, firstname: 'a'.repeat(50) });

    // Assert
    expect(component.inscriptionForm.controls.firstname.valid).toBe(true);
  });

  it('rejects a first name of 51 characters', () => {
    // Act
    component.inscriptionForm.setValue({ ...formulaireValide, firstname: 'a'.repeat(51) });

    // Assert
    expect(component.inscriptionForm.controls.firstname.valid).toBeFalsy();
  });

  // A : cas anormal
  it('rejects an email without "@"', () => {
    // Act
    component.inscriptionForm.setValue({ ...formulaireValide, email: 'lea.fitbook.be' });

    // Assert
    expect(component.inscriptionForm.controls.email.hasError('email')).toBe(true);
  });

  // L : limite du mot de passe (5 refusé, 6 accepté)
  it('rejects a password of 5 characters', () => {
    // Act
    component.inscriptionForm.setValue({ ...formulaireValide, plainPassword: 'Secre', confirmation: 'Secre' });

    // Assert
    expect(component.inscriptionForm.controls.plainPassword.valid).toBeFalsy();
  });

  it('accepts a password of exactly 6 characters', () => {
    // Act
    component.inscriptionForm.setValue({ ...formulaireValide, plainPassword: 'Secret', confirmation: 'Secret' });

    // Assert
    expect(component.inscriptionForm.controls.plainPassword.valid).toBe(true);
  });

  // E : erreurs possibles
  it('reports an error when the confirmation is different from the password', () => {
    // Act
    component.inscriptionForm.setValue({ ...formulaireValide, confirmation: 'Secret2' });

    // Assert
    expect(component.inscriptionForm.hasError('differents')).toBe(true);
  });

  it('rejects the form when the terms of use are not accepted', () => {
    // Act
    component.inscriptionForm.setValue({ ...formulaireValide, cgu: false });

    // Assert
    expect(component.inscriptionForm.valid).toBeFalsy();
  });

  // Tests dans le DOM : ce que l'utilisateur voit après avoir cliqué sur « Créer mon compte »
  it('shows the error messages under the fields when I send an empty form', () => {
    // Arrange
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;

    // Act
    $page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();

    // Assert
    expect($page.querySelector('.alerte')?.textContent).toContain('Veuillez remplir correctement les champs');
    expect($page.querySelectorAll('.champ-erreur').length).toBeGreaterThanOrEqual(4);
    expect($page.textContent).toContain('Vous devez accepter les conditions');
    expect(mockAuthService.inscription).not.toHaveBeenCalled();
  });

  it('creates the account and goes to "verify your email" when the form is correct', async () => {
    // Arrange
    mockAuthService.inscription.mockReturnValue(of({} as any));
    component.inscriptionForm.setValue(formulaireValide);

    // Act
    component.inscription();
    await fixture.whenStable();

    // Assert
    expect(mockAuthService.inscription).toHaveBeenCalledWith({
      firstname: 'Léa', lastname: 'Dupont', email: 'lea@fitbook.be', plainPassword: 'Secret1', accentColor: 'vert',
    });
    expect(TestBed.inject(Router).url).toBe('/verifiez-email?email=lea@fitbook.be');
  });

  it('shows "Un compte existe déjà" when Symfony answers 422', () => {
    // Arrange
    mockAuthService.inscription.mockReturnValue(throwError(() => ({ status: 422 })));
    component.inscriptionForm.setValue(formulaireValide);
    fixture.detectChanges();

    // Act
    component.inscription();
    fixture.detectChanges();

    // Assert
    expect((fixture.nativeElement as HTMLElement).querySelector('.alerte')?.textContent).toContain('Un compte existe déjà');
  });

  it('shows "Erreur serveur" for any other error', () => {
    // Arrange
    mockAuthService.inscription.mockReturnValue(throwError(() => ({ status: 500 })));
    component.inscriptionForm.setValue(formulaireValide);

    // Act
    component.inscription();

    // Assert
    expect(component.erreur()).toBe('Erreur serveur, réessayez plus tard');
  });

  it('shows the password in clear text when I click the eye, and hides it again', () => {
    // Arrange
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;
    const [$oeilMotDePasse, $oeilConfirmation] = Array.from($page.querySelectorAll<HTMLButtonElement>('.oeil'));

    // Act
    $oeilMotDePasse.click();
    $oeilConfirmation.click();
    fixture.detectChanges();

    // Assert
    expect($page.querySelector('#plainPassword')?.getAttribute('type')).toBe('text');
    expect($page.querySelector('#confirmation')?.getAttribute('type')).toBe('text');
  });

  it('gives 1 point per rule respected to the password strength (0 to 4)', () => {
    // Act + Assert
    component.inscriptionForm.controls.plainPassword.setValue('abc');
    expect(component.force()).toBe(0);
    expect(component.libelleForce()).toBe('');

    component.inscriptionForm.controls.plainPassword.setValue('Fitbook1');
    expect(component.force()).toBe(3);
    expect(component.libelleForce()).toBe('Bon');

    component.inscriptionForm.controls.plainPassword.setValue('Fitbook1!');
    expect(component.force()).toBe(4);
    expect(component.libelleForce()).toBe('Fort');
  });

  it('ticks the colour I choose', () => {
    // Arrange
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;

    // Act
    $page.querySelectorAll<HTMLInputElement>('.couleur input')[1].click(); // orange
    fixture.detectChanges();

    // Assert
    expect(component.inscriptionForm.value.accentColor).toBe('orange');
    expect($page.querySelector('.couleur.choisie')?.textContent).toContain('Orange');
  });
});
