import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeanceService } from '../../seances/seance-service';
import { SeanceInterface } from '../../seances/seance-interface';

@Component({
  selector: 'app-reservation-confirmee',
  imports: [DatePipe, RouterLink],
  templateUrl: './reservation-confirmee.html',
  styleUrl: './reservation-confirmee.css',
})
export class ReservationConfirmee implements OnInit {
  private route = inject(ActivatedRoute);
  private seanceService = inject(SeanceService);

  // Numéro de réservation et séance reçus dans l'adresse : /reservation-confirmee?numero=...&seance=12
  numero = '';
  seance = signal<SeanceInterface | null>(null);

  ngOnInit(): void {
    const parametres = this.route.snapshot.queryParamMap;
    this.numero = parametres.get('numero') ?? '';
    const idSeance = Number(parametres.get('seance'));
    if (idSeance) {
      this.seanceService.getUneSeance(idSeance).subscribe((reponse) => this.seance.set(reponse));
    }
  }
}
