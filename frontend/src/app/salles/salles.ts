import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SalleService } from './salle-service';
import { SalleInterface } from './salle-interface';

@Component({
  selector: 'app-salles',
  imports: [RouterLink],
  templateUrl: './salles.html',
  styleUrl: './salles.css',
})
export class Salles implements OnInit {
  private salleService = inject(SalleService);
  salles = signal<SalleInterface[]>([]);
  recherche = signal('');

  // Filtre sur le nom ou la ville, sans tenir compte des majuscules
  sallesFiltrees = computed(() => {
    const texte = this.recherche().toLowerCase();
    return this.salles().filter(
      (s) => s.nom.toLowerCase().includes(texte) || s.ville.toLowerCase().includes(texte),
    );
  });

  // Au chargement de la page, on récupère les salles depuis l'API
  ngOnInit(): void {
    this.salleService.getSalles().subscribe((reponse) => {
      this.salles.set(reponse.member);
    });
  }
}