import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SeanceService } from '../seances/seance-service';
import { SeanceInterface } from '../seances/seance-interface';
import { SalleService } from '../salles/salle-service';
import { SalleInterface } from '../salles/salle-interface';
import { AuthService } from '../auth/auth-service';

@Component({
  selector: 'app-accueil',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export class Accueil implements OnInit {
  private seanceService = inject(SeanceService);
  private salleService = inject(SalleService);
  private router = inject(Router);
  authService = inject(AuthService);

  seances = signal<SeanceInterface[]>([]);
  salles = signal<SalleInterface[]>([]);

  // Barre de recherche du bandeau
  quoi = '';
  ou = '';
  quand = '';

  // Les 4 prochaines séances ouvertes (« Activités à venir »)
  prochainesSeances = computed(() => this.seances().filter((s) => s.statut === 'ouverte').slice(0, 4));

  // Une grande salle + deux petites (« Salles populaires »)
  salleVedette = computed(() => this.salles()[0]);
  autresSalles = computed(() => this.salles().slice(1, 3));

  // Bande défilante
  activitesDefilantes = ['Musculation', 'Boxe', 'Yoga', 'CrossFit', 'Cardio', 'Pilates', 'HIIT', 'Zumba'];

  ngOnInit(): void {
    this.seanceService.getSeances().subscribe((reponse) => this.seances.set(reponse.member));
    this.salleService.getSalles().subscribe((reponse) => this.salles.set(reponse.member));
  }

  // Envoie la recherche vers la page Activités (les filtres sont dans l'URL)
  rechercher(): void {
    this.router.navigate(['/activites'], {
      queryParams: { quoi: this.quoi || null, ou: this.ou || null, quand: this.quand || null },
    });
  }
}
