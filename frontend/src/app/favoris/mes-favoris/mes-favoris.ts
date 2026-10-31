import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoriService } from '../favori-service';
import { SalleService } from '../../salles/salle-service';
import { SalleInterface } from '../../salles/salle-interface';
import { CoachService } from '../../coach/coach-service';
import { CoachInterface } from '../../coach/coach-interface';
import { CoursService } from '../../cours/cours-service';
import { CoursInterface } from '../../cours/cours-interface';
import { SidebarSportif } from '../../layout/sidebar-sportif/sidebar-sportif';

@Component({
  selector: 'app-mes-favoris',
  imports: [RouterLink, SidebarSportif],
  templateUrl: './mes-favoris.html',
  styleUrl: './mes-favoris.css',
})
export class MesFavoris implements OnInit {
  favoriService = inject(FavoriService);
  salleService = inject(SalleService);
  coachService = inject(CoachService);
  private coursService = inject(CoursService);

  salles = signal<SalleInterface[]>([]);
  coaches = signal<CoachInterface[]>([]);
  cours = signal<CoursInterface[]>([]);

  // On garde seulement les éléments dont le lien est dans ses favoris
  sallesFavorites = computed(() =>
    this.salles().filter((s) => this.favoriService.favoris().favoriSalles.includes('/api/salles/' + s.id)),
  );
  coachesFavoris = computed(() =>
    this.coaches().filter((c) => this.favoriService.favoris().favoriCoachs.includes('/api/coaches/' + c.id)),
  );
  coursFavoris = computed(() =>
    this.cours().filter((c) => this.favoriService.favoris().favoriCours.includes('/api/cours/' + c.id)),
  );

  ngOnInit(): void {
    this.favoriService.charger();
    this.salleService.getSalles().subscribe((reponse) => this.salles.set(reponse.member));
    this.coachService.getCoaches().subscribe((reponse) => this.coaches.set(reponse.member));
    this.coursService.getCours().subscribe((reponse) => this.cours.set(reponse.member));
  }
}
