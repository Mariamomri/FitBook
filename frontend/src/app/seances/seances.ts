import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SeanceService } from './seance-service';
import { SeanceInterface } from './seance-interface';
import { AuthService } from '../auth/auth-service';

@Component({
  selector: 'app-seances',
  imports: [DatePipe],
  templateUrl: './seances.html',
  styleUrl: './seances.css',
})
export class Seances implements OnInit {
  private seanceService = inject(SeanceService);
  authService = inject(AuthService);
  seances = signal<SeanceInterface[]>([]);
  message = signal('');
  erreur = signal('');

  ngOnInit(): void {
    this.chargerSeances();
  }

  // Récupère les séances depuis l'API
  chargerSeances(): void {
    this.seanceService.getSeances().subscribe((reponse) => {
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
