import { Component, OnInit, inject, signal } from '@angular/core';
import { CoursService } from './cours-service';
import { CoursInterface } from './cours-interface';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cours',
  imports: [RouterLink],
  templateUrl: './cours.html',
  styleUrl: './cours.css',
})
export class Cours implements OnInit {
  private coursService = inject(CoursService);
  cours = signal<CoursInterface[]>([]);

  // Au chargement de la page, on récupère les cours depuis l'API
  ngOnInit(): void {
    this.coursService.getCours().subscribe((reponse) => {
      this.cours.set(reponse.member);
    });
  }
}
