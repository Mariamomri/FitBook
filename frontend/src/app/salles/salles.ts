import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SalleService } from './salle-service';
import { SalleInterface } from './salle-interface';
import { FavoriService } from '../favoris/favori-service';
import { AuthService } from '../auth/auth-service';

@Component({
  selector: 'app-salles',
  imports: [RouterLink],
  templateUrl: './salles.html',
  styleUrl: './salles.css',
})
export class Salles implements OnInit {
  salleService = inject(SalleService);
  private sanitizer = inject(DomSanitizer);
  favoriService = inject(FavoriService);
  authService = inject(AuthService);
  salles = signal<SalleInterface[]>([]);

  // Filtres de la barre de recherche
  recherche = signal('');
  ville = signal('');
  tri = signal('nom');

  // Salle mise en avant sur la carte
  salleChoisie = signal<SalleInterface | null>(null);

  // Liste filtrée puis triée : recalculée quand un filtre change
  sallesFiltrees = computed(() => {
    const texte = this.recherche().toLowerCase();
    const ville = this.ville().toLowerCase();
    const liste = this.salles().filter(
      (s) =>
        (s.nom.toLowerCase().includes(texte) || s.description.toLowerCase().includes(texte)) &&
        s.ville.toLowerCase().includes(ville),
    );

    if (this.tri() === 'capacite') {
      return liste.sort((a, b) => b.capacite - a.capacite);
    }
    return liste.sort((a, b) => a.nom.localeCompare(b.nom));
  });

  // Salle affichée sur la carte : celle choisie, sinon la première de la liste
  salleSurCarte = computed(() => this.salleChoisie() ?? this.sallesFiltrees()[0]);

  // Carte OpenStreetMap centrée sur la latitude / longitude de la salle
  carteUrl = computed(() => {
    const s = this.salleSurCarte();
    // Sans coordonnées : on montre Bruxelles
    const latitude = Number(s?.latitude ?? 50.8466);
    const longitude = Number(s?.longitude ?? 4.3528);

    // bbox = la zone visible autour du point (gauche, bas, droite, haut)
    const zone = [longitude - 0.01, latitude - 0.005, longitude + 0.01, latitude + 0.005].join('%2C');
    let url = 'https://www.openstreetmap.org/export/embed.html?bbox=' + zone + '&layer=mapnik';
    if (s?.latitude && s?.longitude) {
      url += '&marker=' + latitude + '%2C' + longitude;
    }

    // Angular bloque les liens d'iframe construits dans le code : on lui dit que celui-ci est sûr
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  // Au chargement de la page, on récupère les salles depuis l'API
  ngOnInit(): void {
    this.favoriService.charger();
    this.salleService.getSalles().subscribe((reponse) => {
      this.salles.set(reponse.member);
    });
  }
}
