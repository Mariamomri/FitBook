import { Component, OnInit, inject, signal } from '@angular/core';
import { CoachService } from './coach-service';
import { CoachInterface } from './coach-interface';

@Component({
  selector: 'app-coach',
  imports: [],
  templateUrl: './coach.html',
  styleUrl: './coach.css',
})
export class Coach implements OnInit {
  private coachService = inject(CoachService);
  coaches = signal<CoachInterface[]>([]);

  // Au chargement de la page, on récupère les coachs depuis l'API
  ngOnInit(): void {
    this.coachService.getCoaches().subscribe((reponse) => {
      this.coaches.set(reponse.member);
    });
  }
}
