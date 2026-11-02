import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoachService } from './coach-service';
import { CoachInterface } from './coach-interface';
import { FavoriService } from '../favoris/favori-service';
import { AuthService } from '../auth/auth-service';

@Component({
  selector: 'app-coach',
  imports: [RouterLink],
  templateUrl: './coach.html',
  styleUrl: './coach.css',
})
export class Coach implements OnInit {
  coachService = inject(CoachService);
  favoriService = inject(FavoriService);
  authService = inject(AuthService);
  coaches = signal<CoachInterface[]>([]);

  // Filtres
  recherche = signal('');
  languesChoisies = signal<string[]>([]);
  tarifMax = signal(100);
  tri = signal('experience');

  // Liste des langues parlées par les coachs, sans doublon
  langues = computed(() => {
    const toutes = this.coaches().flatMap((c) => c.langues.split(',').map((l) => l.trim()));
    return [...new Set(toutes)];
  });

  // Liste filtrée puis triée : recalculée quand un filtre change
  coachesFiltres = computed(() => {
    const texte = this.recherche().toLowerCase();
    const liste = this.coaches().filter(
      (c) =>
        c.nomComplet.toLowerCase().includes(texte) &&
        (this.languesChoisies().length === 0 || this.languesChoisies().some((l) => c.langues.includes(l))) &&
        Number(c.tarif) <= this.tarifMax(),
    );

    if (this.tri() === 'tarif') {
      return liste.sort((a, b) => Number(a.tarif) - Number(b.tarif));
    }
    return liste.sort((a, b) => b.anneesExperience - a.anneesExperience);
  });

  // Au chargement de la page, on récupère les coachs depuis l'API
  ngOnInit(): void {
    this.favoriService.charger();
    this.coachService.getCoaches().subscribe((reponse) => {
      this.coaches.set(reponse.member);
    });
  }

  // Coche / décoche une langue dans les filtres
  basculerLangue(langue: string): void {
    if (this.languesChoisies().includes(langue)) {
      this.languesChoisies.set(this.languesChoisies().filter((l) => l !== langue));
    } else {
      this.languesChoisies.set([...this.languesChoisies(), langue]);
    }
  }
}
