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

  // Recherche par distance : ma position (null tant que je n'ai pas cliqué « Près de moi ») et le rayon en km (0 = tous)
  maPosition = signal<{ latitude: number; longitude: number } | null>(null);
  rayon = signal(0);
  messagePosition = signal('');

  // Salle mise en avant sur la carte
  salleChoisie = signal<SalleInterface | null>(null);

  // Liste filtrée puis triée : recalculée quand un filtre change
  sallesFiltrees = computed(() => {
    const texte = this.recherche().toLowerCase();
    const ville = this.ville().toLowerCase();
    const liste = this.salles().filter(
      (s) =>
        (s.nom.toLowerCase().includes(texte) || s.description.toLowerCase().includes(texte)) &&
        s.ville.toLowerCase().includes(ville) &&
        this.dansLeRayon(s),
    );

    if (this.tri() === 'distance' && this.maPosition()) {
      // Les salles sans coordonnées vont à la fin
      return liste.sort((a, b) => (this.distance(a) ?? 99999) - (this.distance(b) ?? 99999));
    }
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

  // Bouton « Près de moi » : le navigateur demande l'autorisation puis donne la position
  localiser(): void {
    if (!navigator.geolocation) {
      this.messagePosition.set("Votre navigateur ne permet pas la géolocalisation.");
      return;
    }
    this.messagePosition.set('Recherche de votre position...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.maPosition.set({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        this.tri.set('distance');
        this.messagePosition.set('');
      },
      () => this.messagePosition.set("Position refusée : autorisez la localisation dans votre navigateur."),
    );
  }

  // Distance en km entre ma position et la salle (formule de Haversine), null si on ne peut pas la calculer
  distance(salle: SalleInterface): number | null {
    const moi = this.maPosition();
    if (!moi || !salle.latitude || !salle.longitude) {
      return null;
    }
    const rayonTerre = 6371; // km
    const enRadians = (degres: number) => (degres * Math.PI) / 180;
    const dLat = enRadians(Number(salle.latitude) - moi.latitude);
    const dLng = enRadians(Number(salle.longitude) - moi.longitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(enRadians(moi.latitude)) * Math.cos(enRadians(Number(salle.latitude))) * Math.sin(dLng / 2) ** 2;
    return rayonTerre * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Filtre « rayon » : sans position ou sans rayon choisi, toutes les salles passent
  dansLeRayon(salle: SalleInterface): boolean {
    if (!this.maPosition() || this.rayon() === 0) {
      return true;
    }
    const km = this.distance(salle);
    return km !== null && km <= this.rayon();
  }

  // 2.345 → "2,3 km" ; 0.4 → "400 m"
  texteDistance(salle: SalleInterface): string {
    const km = this.distance(salle);
    if (km === null) {
      return '';
    }
    return km < 1 ? Math.round(km * 1000) + ' m' : km.toFixed(1).replace('.', ',') + ' km';
  }

  // Au chargement de la page, on récupère les salles depuis l'API
  ngOnInit(): void {
    this.favoriService.charger();
    this.salleService.getSalles().subscribe((reponse) => {
      this.salles.set(reponse.member);
    });
  }
}
