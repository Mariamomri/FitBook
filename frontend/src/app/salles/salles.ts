import { Component, OnInit, inject, signal } from '@angular/core';
import { SalleService } from './salle-service';
import { SalleInterface } from './salle-interface';

@Component({
  selector: 'app-salles',
  imports: [],
  templateUrl: './salles.html',
  styleUrl: './salles.css',
})
export class Salles implements OnInit {
  private salleService = inject(SalleService);
  salles = signal<SalleInterface[]>([]);

  // Au chargement de la page, on récupère les salles depuis l'API
  ngOnInit(): void {
    this.salleService.getSalles().subscribe((reponse) => {
      this.salles.set(reponse.member);
    });
  }
}
