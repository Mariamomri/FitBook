import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { Coach } from './coach';

// Le composant a besoin du routeur et de HttpClient : provideHttpClientTesting remplace le vrai serveur (pas de réseau)
describe('Coach', () => {
  let component: Coach;
  let fixture: ComponentFixture<Coach>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coach],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Coach);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
