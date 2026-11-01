import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SidebarSportif } from '../../layout/sidebar-sportif/sidebar-sportif';
import { CarteMembreService } from '../carte-membre-service';
import { CarteMembreInterface } from '../carte-membre-interface';
import { AuthService } from '../../auth/auth-service';
import { UserInterface } from '../../auth/user-interface';

@Component({
  selector: 'app-ma-carte',
  imports: [DatePipe, SidebarSportif],
  templateUrl: './ma-carte.html',
  styleUrl: './ma-carte.css',
})
export class MaCarte implements OnInit {
  carteMembreService = inject(CarteMembreService);
  private authService = inject(AuthService);

  carte = signal<CarteMembreInterface | null>(null);
  moi = signal<UserInterface | null>(null);
  charge = signal(false);
  succes = signal('');
  erreur = signal('');

  ngOnInit(): void {
    this.authService.getMoi().subscribe((reponse) => this.moi.set(reponse));
    this.carteMembreService.getMaCarte().subscribe({
      next: (reponse) => {
        this.carte.set(reponse);
        this.charge.set(true);
      },
      error: () => {
        this.erreur.set('Impossible de charger votre carte.');
        this.charge.set(true);
      },
    });
  }

  // Première demande ou renouvellement d'une carte expirée
  demander(): void {
    this.erreur.set('');
    this.carteMembreService.demanderCarte().subscribe({
      next: (reponse) => {
        this.carte.set(reponse);
        this.succes.set('Votre carte de membre est active pour 1 an.');
      },
      // 403 : carte suspendue / 422 : carte encore valable
      error: (err) => this.erreur.set(err.error?.message ?? 'Impossible de créer la carte.'),
    });
  }
}
