import { Component, OnInit, computed, inject, signal } from '@angular/core';
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

  // Séance choisie dans « Autres créneaux » (null = la prochaine)
  idChoisi = signal<number | null>(null);

  // Séances pas encore passées
  seancesAVenir = computed(() => this.seances().filter((s) => s.statut !== 'terminee'));

  // Séance affichée dans la carte de réservation (à droite)
  seanceAffichee = computed(
    () => this.seancesAVenir().find((s) => s.id === this.idChoisi()) ?? this.seancesAVenir()[0] ?? null,
  );

  // Les autres séances (boutons « Autres créneaux »)
  autresCreneaux = computed(() => this.seancesAVenir().filter((s) => s.id !== this.seanceAffichee()?.id));

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

  // Clic sur un autre créneau : il s'affiche dans la carte de réservation
  choisir(idSeance: number): void {
    this.idChoisi.set(idSeance);
    this.message.set('');
    this.erreur.set('');
  }

  // Titre en deux couleurs : le dernier mot en vert (comme sur la maquette)
  debutTitre(titre: string): string {
    return titre.split(' ').slice(0, -1).join(' ');
  }
  finTitre(titre: string): string {
    return titre.split(' ').slice(-1)[0];
  }

  // Remplissage de la barre de places (en %)
  pourcentage(seance: SeanceInterface, capacite: number): number {
    return ((capacite - seance.placesRestantes) / capacite) * 100;
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
