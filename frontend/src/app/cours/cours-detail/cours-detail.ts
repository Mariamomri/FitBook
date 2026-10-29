import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CoursService } from '../cours-service';
import { CoursInterface } from '../cours-interface';
import { SeanceService } from '../../seances/seance-service';
import { SeanceInterface } from '../../seances/seance-interface';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-cours-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './cours-detail.html',
  styleUrl: './cours-detail.css',
})
export class CoursDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private coursService = inject(CoursService);
  private seanceService = inject(SeanceService);
  authService = inject(AuthService);

  cours = signal<CoursInterface | null>(null);
  seances = signal<SeanceInterface[]>([]);
  message = signal('');
  erreur = signal('');
  private idCours = 0;

  ngOnInit(): void {
    // On lit l'id dans l'URL : /activites/2001
    this.idCours = Number(this.route.snapshot.paramMap.get('id'));

    this.coursService.getUnCours(this.idCours).subscribe((reponse) => {
      this.cours.set(reponse);
    });
    this.chargerSeances();
  }

  chargerSeances(): void {
    this.seanceService.getSeancesDuCours(this.idCours).subscribe((reponse) => {
      this.seances.set(reponse.member);
    });
  }

  reserver(idSeance: number): void {
    this.message.set('');
    this.erreur.set('');

    this.seanceService.reserver(idSeance).subscribe({
      next: () => {
        this.message.set('Réservation confirmée !');
        this.chargerSeances(); // met à jour les places restantes
      },
      error: (err) => {
        // 422 : séance complète ou déjà réservée / 403 : email non confirmé
        this.erreur.set(err.error?.detail || 'Erreur lors de la réservation');
      },
    });
  }
}