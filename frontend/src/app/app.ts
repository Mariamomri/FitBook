import { Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { ThemeService } from './theme/theme-service';
import { PageAnimator } from './animations/page-animator';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  private themeService = inject(ThemeService);
  private pageAnimator = inject(PageAnimator);

  // Au chargement du site : on remet la couleur choisie par l'utilisateur
  constructor() {
    this.themeService.restaurer();

    // Une fois le site affiché, les pages s'animent toutes seules
    afterNextRender(() => {
      const zone = document.querySelector('main');
      if (zone) {
        this.pageAnimator.demarrer(zone);
      }
    });
  }
}
