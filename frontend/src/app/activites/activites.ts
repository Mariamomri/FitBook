import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CoursService } from '../cours/cours-service';
import { CoursInterface } from '../cours/cours-interface';

@Component({
  selector: 'app-activites',
  imports: [RouterLink],
  templateUrl: './activites.html',
  styleUrl: './activites.css',
})
export class Activites implements OnInit {
  private coursService = inject(CoursService);
  cours = signal<CoursInterface[]>([]);

  // La page Activités affiche les cours (comme sur la maquette)
  ngOnInit(): void {
    this.coursService.getCours().subscribe((reponse) => {
      this.cours.set(reponse.member);
    });
  }
}