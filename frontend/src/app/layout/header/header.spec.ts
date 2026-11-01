import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Header],
      // Routes vides : les clics sur les liens ne chargent aucune vraie page
      providers: [provideRouter([{ path: '**', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the mobile menu when I click the burger button', () => {
    // Arrange
    const burger = fixture.nativeElement.querySelector('.burger') as HTMLButtonElement;

    // Act
    burger.click();

    // Assert
    expect(component.menuOuvert()).toBe(true);
  });

  it('closes the mobile menu when I click the burger button a second time', () => {
    // Arrange
    const burger = fixture.nativeElement.querySelector('.burger') as HTMLButtonElement;
    burger.click();

    // Act
    burger.click();

    // Assert
    expect(component.menuOuvert()).toBe(false);
  });

  it('logs out the user and closes the menu', () => {
    // Arrange
    component.authService.saveToken('abc123');
    component.menuOuvert.set(true);

    // Act
    component.deconnexion();

    // Assert
    expect(component.authService.connecte()).toBe(false);
    expect(component.menuOuvert()).toBe(false);
  });

  it('shows Dashboard and Profil only to a logged-in user', () => {
    // Arrange
    component.authService.saveToken('abc123');

    // Act
    fixture.detectChanges();
    const $liens = (fixture.nativeElement as HTMLElement).querySelector('.liens')!;

    // Assert
    expect($liens.textContent).toContain('Dashboard');
    expect($liens.textContent).toContain('Profil');
  });

  it('closes the mobile menu after a click on each link (visitor)', () => {
    // Arrange
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;
    component.menuOuvert.set(true);
    fixture.detectChanges();
    const nombreDeLiens = $page.querySelectorAll('.menu-mobile .menu-liens a, .menu-mobile .menu-boutons a').length;

    // Act + Assert : j'ouvre le menu, je clique sur le lien n°i, le menu se ferme
    for (let i = 0; i < nombreDeLiens; i++) {
      component.menuOuvert.set(true);
      fixture.detectChanges();
      $page.querySelectorAll<HTMLAnchorElement>('.menu-mobile .menu-liens a, .menu-mobile .menu-boutons a')[i].click();
      fixture.detectChanges();
      expect(component.menuOuvert()).toBe(false);
    }
    expect(nombreDeLiens).toBe(7); // 5 liens + Connexion + Inscription
  });

  it('closes the mobile menu after a click on Dashboard or Profil (logged-in user)', () => {
    // Arrange
    component.authService.saveToken('abc123');
    fixture.detectChanges();
    const $page: HTMLElement = fixture.nativeElement;

    // Act + Assert
    for (const texte of ['Dashboard', 'Profil']) {
      component.menuOuvert.set(true);
      fixture.detectChanges();
      const $lien = Array.from($page.querySelectorAll<HTMLAnchorElement>('.menu-mobile a')).find(($a) => $a.textContent?.includes(texte))!;
      $lien.click();
      fixture.detectChanges();
      expect(component.menuOuvert()).toBe(false);
    }
  });

  it('logs out from the button of the mobile menu', () => {
    // Arrange
    component.authService.saveToken('abc123');
    component.menuOuvert.set(true);
    fixture.detectChanges();

    // Act
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.menu-boutons button')!.click();
    fixture.detectChanges();

    // Assert
    expect(component.authService.connecte()).toBe(false);
  });

  it('logs out from the button of the top bar', () => {
    // Arrange
    component.authService.saveToken('abc123');
    fixture.detectChanges();

    // Act
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.actions button')!.click();
    fixture.detectChanges();

    // Assert
    expect(component.authService.connecte()).toBe(false);
  });
});
