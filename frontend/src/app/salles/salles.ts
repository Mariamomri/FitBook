import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SalleService } from './salle-service';
import { SalleInterface } from './salle-interface';

@Component({
  selector: 'app-salles',
  imports: [RouterLink],
  templateUrl: './salles.html',
  styleUrl: './salles.css',
})
export class Salles implements OnInit {
  private salleService = inject(SalleService);
  private sanitizer = inject(DomSanitizer);
  salles = signal<SalleInterface[]>([]);

  // Filtres de la barre de recherche
  recherche = signal('');
  ville = signal('');
  tri = signal('nom');

  // Photos des salles (dans public/img), en attendant les images du backend
  photos = ['img/gym1.jpg', 'img/gym2.jpg', 'img/barbell.jpg', 'img/stretch.jpg', 'img/battle-ropes.jpg', 'img/crossfit.jpg'];

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

  // Lien de la carte à partir de l'adresse de la salle (pas de coordonnées dans la base)
  carteUrl = computed(() => {
    const s = this.salleSurCarte();
    const adresse = s ? s.nom + ', ' + s.adresse + ', ' + s.codePostal + ' ' + s.ville : 'Belgique';
    const url = 'https://maps.google.com/maps?q=' + encodeURIComponent(adresse) + '&z=15&output=embed';
    // Angular bloque les liens d'iframe construits dans le code : on lui dit que celui-ci est sûr
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  // Une photo par salle : on reprend la liste depuis le début quand elle est finie
  photo(numero: number): string {
    return this.photos[numero % this.photos.length];
  }

  // Au chargement de la page, on récupère les salles depuis l'API
  ngOnInit(): void {
    this.salleService.getSalles().subscribe((reponse) => {
      this.salles.set(reponse.member);
    });
  }
}
