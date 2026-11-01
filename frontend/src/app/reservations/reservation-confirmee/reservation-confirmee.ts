import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeanceService } from '../../seances/seance-service';
import { SeanceInterface } from '../../seances/seance-interface';
import { ReservationService } from '../reservation-service';

@Component({
  selector: 'app-reservation-confirmee',
  imports: [DatePipe, RouterLink],
  templateUrl: './reservation-confirmee.html',
  styleUrl: './reservation-confirmee.css',
})
export class ReservationConfirmee implements OnInit {
  private route = inject(ActivatedRoute);
  private seanceService = inject(SeanceService);
  private reservationService = inject(ReservationService);

  // Numéro de réservation et séance reçus dans l'adresse : /reservation-confirmee?numero=...&seance=12
  numero = '';
  seance = signal<SeanceInterface | null>(null);
  qrCode = signal(''); // image du QR code

  ngOnInit(): void {
    const parametres = this.route.snapshot.queryParamMap;
    this.numero = parametres.get('numero') ?? '';
    if (this.numero) {
      this.reservationService.qrCode(this.numero).then((image) => this.qrCode.set(image));
    }
    const idSeance = Number(parametres.get('seance'));
    if (idSeance) {
      this.seanceService.getUneSeance(idSeance).subscribe((reponse) => this.seance.set(reponse));
    }
  }
}
