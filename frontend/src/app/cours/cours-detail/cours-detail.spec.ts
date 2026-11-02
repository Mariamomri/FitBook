import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { CoursDetail } from './cours-detail';

// Le composant a besoin du routeur et de HttpClient : provideHttpClientTesting remplace le vrai serveur (pas de réseau)
describe('CoursDetail', () => {
  let component: CoursDetail;
  let fixture: ComponentFixture<CoursDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursDetail],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CoursDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
