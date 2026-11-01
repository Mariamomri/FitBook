import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { type Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

import { Login } from './login';
import { AuthService } from '../auth-service';
import { UserInterface } from '../user-interface';

// Formulaire de connexion : on vérifie ce que l'utilisateur VOIT dans la page après l'envoi
describe('Login', () => {
  let fixture: ComponentFixture<Login>;

  const mockAuthService: Mocked<Pick<AuthService, 'login' | 'saveToken' | 'getMoi' | 'connecte' | 'logout'>> = {
    login: vi.fn(),
    saveToken: vi.fn(),
    getMoi: vi.fn(),
    connecte: vi.fn() as any,
    logout: vi.fn(),
  };

  // Remplit les champs comme le ferait l'utilisateur, puis envoie le formulaire
  const envoyer = (email: string, motDePasse: string) => {
    const $page: HTMLElement = fixture.nativeElement;
    const $email = $page.querySelector<HTMLInputElement>('#email')!;
    const $motDePasse = $page.querySelector<HTMLInputElement>('#password')!;
    $email.value = email;
    $email.dispatchEvent(new Event('input'));
    $motDePasse.value = motDePasse;
    $motDePasse.dispatchEvent(new Event('input'));
    $page.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockAuthService.connecte.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([{ path: 'dashboard', children: [] }]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
  });

  // O : champs oubliés
  it('shows an error and does not call Symfony when the fields are empty', () => {
    // Act
    envoyer('', '');
    const $erreur = (fixture.nativeElement as HTMLElement).querySelector('.alerte');

    // Assert
    expect($erreur?.textContent).toContain('Veuillez remplir correctement les champs');
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  // A : cas anormal
  it('shows "Email invalide" under the field when I leave it with an email without "@"', () => {
    // Arrange
    const $page: HTMLElement = fixture.nativeElement;
    const $email = $page.querySelector<HTMLInputElement>('#email')!;

    // Act : je tape l'email puis je quitte le champ (blur = le champ devient "touched")
    $email.value = 'mariam.fitbook.be';
    $email.dispatchEvent(new Event('input'));
    $email.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    const $champ = $page.querySelector('.champ-erreur');

    // Assert
    expect($champ?.textContent).toContain('Email invalide');
  });

  // N : cas normal
  it('saves the token and goes to the dashboard when the login is correct', async () => {
    // Arrange
    mockAuthService.login.mockReturnValue(of({ token: 'abc123' }));
    mockAuthService.getMoi.mockReturnValue(of({ accentColor: 'vert' } as UserInterface));

    // Act
    envoyer('mariam@fitbook.be', 'Secret123');
    await fixture.whenStable();

    // Assert
    expect(mockAuthService.login).toHaveBeenCalledWith('mariam@fitbook.be', 'Secret123');
    expect(mockAuthService.saveToken).toHaveBeenCalledWith('abc123');
    expect(TestBed.inject(Router).url).toBe('/dashboard');
  });

  // E : erreurs possibles
  it('shows "Email ou mot de passe incorrect" when Symfony answers 401', () => {
    // Arrange
    mockAuthService.login.mockReturnValue(throwError(() => ({ status: 401, error: { message: 'Invalid credentials.' } })));

    // Act
    envoyer('mariam@fitbook.be', 'Mauvais1');
    const $erreur = (fixture.nativeElement as HTMLElement).querySelector('.alerte');

    // Assert
    expect($erreur?.textContent).toContain('Email ou mot de passe incorrect');
  });

  it('shows the message sent by Symfony when the account is disabled', () => {
    // Arrange
    mockAuthService.login.mockReturnValue(
      throwError(() => ({ status: 401, error: { message: 'Votre compte a été désactivé.' } })),
    );

    // Act
    envoyer('mariam@fitbook.be', 'Secret123');
    const $erreur = (fixture.nativeElement as HTMLElement).querySelector('.alerte');

    // Assert
    expect($erreur?.textContent).toContain('Votre compte a été désactivé.');
  });
});
