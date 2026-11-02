import { Injectable, signal } from '@angular/core';

// Mode du site : sombre ou clair
export type Mode = 'dark' | 'light';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  // Couleurs du site proposées (mêmes noms que dans styles.css et dans Symfony)
  couleurs = [
    { nom: 'vert', libelle: 'Vert', code: '#a6ff00' },
    { nom: 'orange', libelle: 'Orange', code: '#ff6b00' },
    { nom: 'jaune', libelle: 'Jaune', code: '#ffd600' },
    { nom: 'bleu', libelle: 'Bleu', code: 'cyan' },
    { nom: 'rose', libelle: 'Rose', code: '#ff1493' },
    { nom: 'rouge', libelle: 'Rouge', code: '#ee5253' },
  ];

  // Mode actuel (le bouton du header suit ce signal)
  mode = signal<Mode>('dark');

  // Change la couleur de tout le site : <html data-accent="orange">
  // Les variables CSS de styles.css font le reste
  appliquer(couleur: string): void {
    document.documentElement.dataset['accent'] = couleur;
    localStorage.setItem('couleur', couleur);
  }

  // Change le mode : <html data-theme="light">
  appliquerMode(mode: Mode): void {
    this.poserMode(mode);
    localStorage.setItem('mode', mode);
  }

  // Bouton lune / soleil
  basculerMode(): void {
    this.appliquerMode(this.mode() === 'dark' ? 'light' : 'dark');
  }

  // Au démarrage : on remet la couleur et le mode gardés dans le navigateur
  restaurer(): void {
    this.appliquer(localStorage.getItem('couleur') ?? 'vert');
    this.poserMode(localStorage.getItem('mode') === 'light' ? 'light' : 'dark');
  }

  // Met le mode sur la page sans le sauvegarder
  private poserMode(mode: Mode): void {
    document.documentElement.dataset['theme'] = mode;
    this.mode.set(mode);
  }
}
