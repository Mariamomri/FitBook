import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CoursService } from '../cours-service';
import { CoursInterface } from '../cours-interface';
import { SeanceService } from '../../seances/seance-service';
import { SeanceInterface } from '../../seances/seance-interface';
import { AuthService } from '../../auth/auth-service';
import { FavoriService } from '../../favoris/favori-service';
import { AvisService } from '../../avis/avis-service';
import { AvisInterface } from '../../avis/avis-interface';

@Component({
  selector: 'app-cours-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './cours-detail.html',
  styleUrl: './cours-detail.css',
})
export class CoursDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursService = inject(CoursService);
  private seanceService = inject(SeanceService);
  authService = inject(AuthService);
  favoriService = inject(FavoriService);
  avisService = inject(AvisService);

  cours = signal<CoursInterface | null>(null);
  seances = signal<SeanceInterface[]>([]);
  avis = signal<AvisInterface[]>([]);
  message = signal('');
  erreur = signal('');
  private idCours = 0;

  // Séance choisie dans « Autres créneaux » (null = la prochaine)
  idChoisi = signal<number | null>(null);

  // Lien du cours pour les favoris et les avis ("/api/cours/12")
  lienCours = computed(() => '/api/cours/' + this.cours()?.id);

  // Avis publiés sur ce cours et note moyenne (arrondie à 0,1)
  avisDuCours = computed(() => this.avis().filter((a) => a.statut === 'publie' && a.cours === this.lienCours()));
  noteMoyenne = computed(() => {
    const liste = this.avisDuCours();
    return liste.length === 0 ? 0 : Math.round((liste.reduce((s, a) => s + a.note, 0) / liste.length) * 10) / 10;
  });

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
    this.favoriService.charger();
    this.avisService.getAvis().subscribe((reponse) => this.avis.set(reponse.member));
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

  // "/api/coaches/12" → 12
  idCoach(lien: string | null | undefined): string {
    return lien?.split('/').pop() ?? '';
  }

  reserver(idSeance: number): void {
    this.message.set('');
    this.erreur.set('');

    this.seanceService.reserver(idSeance).subscribe({
      next: (reponse) => {
        // On affiche la page de confirmation avec le numéro de réservation
        this.router.navigate(['/reservation-confirmee'], { queryParams: { numero: reponse.numero, seance: idSeance } });
      },
      error: (err) => {
        // 422 : séance complète ou déjà réservée / 403 : email non confirmé
        this.erreur.set(err.error?.detail || 'Erreur lors de la réservation');
      },
    });
  }
}
