import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeanceService } from '../seances/seance-service';
import { SeanceInterface } from '../seances/seance-interface';
import { ActiviteService } from './activite-service';
import { ActiviteInterface } from './activite-interface';
import { AuthService } from '../auth/auth-service';

@Component({
  selector: 'app-activites',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './activites.html',
  styleUrl: './activites.css',
})
export class Activites implements OnInit {
  private seanceService = inject(SeanceService);
  private activiteService = inject(ActiviteService);
  private route = inject(ActivatedRoute);
  authService = inject(AuthService);

  seances = signal<SeanceInterface[]>([]);
  activites = signal<ActiviteInterface[]>([]);
  message = signal('');
  erreur = signal('');

  // Filtres (panneau de gauche)
  activitesChoisies = signal<string[]>([]);
  recherche = signal('');
  ville = signal('');
  date = signal('');
  prixMax = signal(30);
  placesLibres = signal(false);

  // Liste filtrée : recalculée automatiquement quand un filtre change
  seancesFiltrees = computed(() =>
    this.seances().filter(
      (s) =>
        s.statut !== 'terminee' &&
        (this.activitesChoisies().length === 0 || this.activitesChoisies().includes(s.activiteNom)) &&
        this.correspondRecherche(s) &&
        s.ville.toLowerCase().includes(this.ville().toLowerCase()) &&
        (!this.date() || s.dateDebut.startsWith(this.date())) &&
        Number(s.prix) <= this.prixMax() &&
        (!this.placesLibres() || s.placesRestantes > 0),
    ),
  );

  ngOnInit(): void {
    // Recherche envoyée depuis l'accueil : /activites?quoi=boxe&ou=Liège&quand=2026-11-06
    const parametres = this.route.snapshot.queryParamMap;
    this.recherche.set(parametres.get('quoi') ?? '');
    this.ville.set(parametres.get('ou') ?? '');
    this.date.set(parametres.get('quand') ?? '');

    this.chargerSeances();
    this.activiteService.getActivites().subscribe((reponse) => {
      this.activites.set(reponse.member);
    });
  }

  // Récupère les séances depuis l'API
  chargerSeances(): void {
    this.seanceService.getSeances().subscribe((reponse) => {
      this.seances.set(reponse.member);
    });
  }

  // Le texte recherché est dans le titre, l'activité, la salle ou le coach
  correspondRecherche(seance: SeanceInterface): boolean {
    const texte = this.recherche().toLowerCase();
    return [seance.coursTitre, seance.activiteNom, seance.salleNom, seance.coachNom ?? ''].some((valeur) =>
      valeur.toLowerCase().includes(texte),
    );
  }

  // Coche / décoche une activité dans les filtres
  basculerActivite(nom: string): void {
    if (this.activitesChoisies().includes(nom)) {
      this.activitesChoisies.set(this.activitesChoisies().filter((a) => a !== nom));
    } else {
      this.activitesChoisies.set([...this.activitesChoisies(), nom]);
    }
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
