import { Injectable } from '@angular/core';

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

  // Change la couleur de tout le site : <html data-accent="orange">
  // Les variables CSS de styles.css font le reste
  appliquer(couleur: string): void {
    document.documentElement.dataset['accent'] = couleur;
    localStorage.setItem('couleur', couleur);
  }

  // Au démarrage : reprend la couleur gardée dans le navigateur
  restaurer(): void {
    this.appliquer(localStorage.getItem('couleur') ?? 'vert');
  }
}
