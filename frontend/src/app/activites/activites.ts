import { Component, OnInit, inject, signal } from '@angular/core';
import { ActiviteService } from './activite-service';
import { ActiviteInterface } from './activite-interface';

@Component({
  selector: 'app-activites',
  imports: [],
  templateUrl: './activites.html',
  styleUrl: './activites.css',
})
export class Activites implements OnInit {
  private activiteService = inject(ActiviteService);
  activites = signal<ActiviteInterface[]>([]);

  ngOnInit(): void {
    this.activiteService.getActivites().subscribe((reponse) => {
      this.activites.set(reponse.member);
    });
  }
}