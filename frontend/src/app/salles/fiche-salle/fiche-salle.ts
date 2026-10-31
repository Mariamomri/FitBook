import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SalleService } from '../salle-service';
import { SalleInterface } from '../salle-interface';
import { CoursService } from '../../cours/cours-service';
import { CoursInterface } from '../../cours/cours-interface';
import { SeanceService } from '../../seances/seance-service';
import { SeanceInterface } from '../../seances/seance-interface';
import { CoachService } from '../../coach/coach-service';
import { CoachInterface } from '../../coach/coach-interface';
import { AvisService } from '../../avis/avis-service';
import { AvisInterface } from '../../avis/avis-interface';
import { HoraireService } from '../../horaires/horaire-service';
import { HoraireInterface } from '../../horaires/horaire-interface';
import { FavoriService } from '../../favoris/favori-service';
import { AuthService } from '../../auth/auth-service';
import { DonnerAvis } from '../../avis/donner-avis/donner-avis';

@Component({
  selector: 'app-fiche-salle',
  imports: [DatePipe, RouterLink, DonnerAvis],
  templateUrl: './fiche-salle.html',
  styleUrl: './fiche-salle.css',
})
export class FicheSalle implements OnInit {
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);
  salleService = inject(SalleService);
  private coursService = inject(CoursService);
  private seanceService = inject(SeanceService);
  coachService = inject(CoachService);
  avisService = inject(AvisService);
  private horaireService = inject(HoraireService);
  favoriService = inject(FavoriService);
  authService = inject(AuthService);

  salle = signal<SalleInterface | null>(null);
  cours = signal<CoursInterface[]>([]);
  seances = signal<SeanceInterface[]>([]);
  coaches = signal<CoachInterface[]>([]);
  avis = signal<AvisInterface[]>([]);
  horaires = signal<HoraireInterface[]>([]);

  jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

  // Lien de la salle ("/api/salles/12") pour retrouver ses cours, avis, horaires et favoris
  lienSalle = computed(() => '/api/salles/' + this.salle()?.id);

  coursDeLaSalle = computed(() => this.cours().filter((c) => c.salle === this.lienSalle()));

  // Prochaines séances ouvertes de ses cours (la plus proche en premier)
  prochainesSeances = computed(() => {
    const ids = this.coursDeLaSalle().map((c) => c.id);
    return this.seances()
      .filter((s) => ids.includes(s.coursId) && s.statut === 'ouverte')
      .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut))
      .slice(0, 6);
  });

  // Les coachs qui donnent un cours dans cette salle
  coachesDeLaSalle = computed(() => {
    const liens = this.coursDeLaSalle().map((c) => c.coach);
    return this.coaches().filter((c) => liens.includes('/api/coaches/' + c.id));
  });

  avisDeLaSalle = computed(() => this.avis().filter((a) => a.statut === 'publie' && a.salle === this.lienSalle()));
  noteMoyenne = computed(() => {
    const liste = this.avisDeLaSalle();
    return liste.length === 0 ? 0 : Math.round((liste.reduce((s, a) => s + a.note, 0) / liste.length) * 10) / 10;
  });

  // Note arrondie pour les étoiles (4,6 → 5 étoiles)
  noteArrondie = computed(() => Math.round(this.noteMoyenne()));

  // Horaires dans l'ordre de la semaine
  horairesDeLaSalle = computed(() =>
    this.horaires()
      .filter((h) => h.salle === this.lienSalle())
      .sort((a, b) => this.jours.indexOf(a.jour) - this.jours.indexOf(b.jour)),
  );

  // Horaire d'aujourd'hui (getDay : 0 = dimanche, 1 = lundi...)
  horaireDuJour = computed(() => {
    const jour = this.jours[(new Date().getDay() + 6) % 7];
    return this.horairesDeLaSalle().find((h) => h.jour === jour) ?? null;
  });

  // Ouvert maintenant ? On compare les heures au format "HH:mm"
  estOuverte = computed(() => {
    const horaire = this.horaireDuJour();
    if (!horaire) {
      return false;
    }
    const maintenant = new Date().toTimeString().slice(0, 5);
    return maintenant >= this.heure(horaire.heureOuverture) && maintenant < this.heure(horaire.heureFermeture);
  });

  // "Vestiaires, douches" → ["Vestiaires", "douches"]
  equipements = computed(() =>
    (this.salle()?.equipements ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e !== ''),
  );

  // Carte OpenStreetMap centrée sur la salle
  carteUrl = computed(() => {
    const s = this.salle();
    if (!s?.latitude || !s?.longitude) {
      return null;
    }
    const latitude = Number(s.latitude);
    const longitude = Number(s.longitude);
    const zone = [longitude - 0.01, latitude - 0.005, longitude + 0.01, latitude + 0.005].join('%2C');
    const url =
      'https://www.openstreetmap.org/export/embed.html?bbox=' + zone + '&layer=mapnik&marker=' + latitude + '%2C' + longitude;
    // Angular bloque les liens d'iframe construits dans le code : on lui dit que celui-ci est sûr
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  ngOnInit(): void {
    // On lit l'id dans l'URL : /salles/2001
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.salleService.getUneSalle(id).subscribe((reponse) => this.salle.set(reponse));
    this.coursService.getCours().subscribe((reponse) => this.cours.set(reponse.member));
    this.seanceService.getSeances().subscribe((reponse) => this.seances.set(reponse.member));
    this.coachService.getCoaches().subscribe((reponse) => this.coaches.set(reponse.member));
    this.avisService.getAvis().subscribe((reponse) => this.avis.set(reponse.member));
    this.horaireService.getHoraires().subscribe((reponse) => this.horaires.set(reponse.member));
    this.favoriService.charger();
  }


  // "Lucas Dubois" → "LD"
  initiales(nom: string): string {
    return nom
      .split(' ')
      .map((mot) => mot.charAt(0))
      .join('')
      .toUpperCase();
  }

  heure(valeur: string): string {
    return valeur.slice(11, 16);
  }
}
