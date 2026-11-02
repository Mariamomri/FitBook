import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Cours } from './cours';

// Le composant a besoin du routeur et de HttpClient : provideHttpClientTesting remplace le vrai serveur (pas de réseau)
describe('Cours', () => {
  let component: Cours;
  let fixture: ComponentFixture<Cours>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cours],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Cours);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
