import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { ThemeService } from './theme/theme-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  private themeService = inject(ThemeService);

  // Au chargement du site : on remet la couleur choisie par l'utilisateur
  constructor() {
    this.themeService.restaurer();
  }
}
