import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Activites } from './activites';

// Le composant a besoin du routeur et de HttpClient : provideHttpClientTesting remplace le vrai serveur (pas de réseau)
describe('Activites', () => {
  let component: Activites;
  let fixture: ComponentFixture<Activites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Activites],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Activites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
