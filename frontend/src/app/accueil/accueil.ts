import { Component, ElementRef, OnDestroy, OnInit, afterNextRender, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SeanceService } from '../seances/seance-service';
import { SeanceInterface } from '../seances/seance-interface';
import { SalleService } from '../salles/salle-service';
import { SalleInterface } from '../salles/salle-interface';
import { AuthService } from '../auth/auth-service';
import { ActiviteService } from '../activites/activite-service';
import { AvisService } from '../avis/avis-service';
import { AvisInterface } from '../avis/avis-interface';
import { CoursService } from '../cours/cours-service';
import { CoursInterface } from '../cours/cours-interface';
import { Reveal } from '../animations/reveal';
import { animationsActives, decouperTexte, lettresDepart, preparerGsap } from '../animations/animer';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-accueil',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, Reveal],
  templateUrl: './accueil.html',
  styleUrl: './accueil.css',
})
export class Accueil implements OnInit, OnDestroy {
  private seanceService = inject(SeanceService);
  salleService = inject(SalleService);
  private router = inject(Router);
  authService = inject(AuthService);
  activiteService = inject(ActiviteService);
  avisService = inject(AvisService);
  private coursService = inject(CoursService);
  private host = inject(ElementRef);

  seances = signal<SeanceInterface[]>([]);
  salles = signal<SalleInterface[]>([]);
  avis = signal<AvisInterface[]>([]);
  cours = signal<CoursInterface[]>([]);

  // Barre de recherche du bandeau
  rechercheForm = new FormGroup({
    quoi: new FormControl(''),
    ou: new FormControl(''),
    quand: new FormControl(''),
  });

  // Les 4 prochaines séances ouvertes (« Activités à venir »)
  prochainesSeances = computed(() => this.seances().filter((s) => s.statut === 'ouverte').slice(0, 4));

  // Une grande salle + deux petites (« Salles populaires »)
  salleVedette = computed(() => this.salles()[0]);
  autresSalles = computed(() => this.salles().slice(1, 3));

  // Les 3 derniers avis publiés (« Ce que disent nos sportifs »)
  derniersAvis = computed(() =>
    this.avis()
      .filter((a) => a.statut === 'publie')
      .slice(-3)
      .reverse(),
  );

  // Bande défilante
  activitesDefilantes = ['Musculation', 'Boxe', 'Yoga', 'CrossFit', 'Cardio', 'Pilates', 'HIIT', 'Zumba'];

  constructor() {
    // Une fois la page affichée, on lance l'animation du bandeau
    afterNextRender(() => this.animerBandeau());
  }

  // Ensemble des animations de la page (on les arrête toutes quand on quitte la page)
  private contexte?: gsap.Context;
  private quitte = false;

  // Animation d'entrée du bandeau + effets au scroll
  private async animerBandeau(): Promise<void> {
    if (!animationsActives()) {
      return;
    }
    preparerGsap();
    const racine = this.host.nativeElement as HTMLElement;
    const titre = racine.querySelector<HTMLElement>('.hero h1');
    if (!titre) {
      return;
    }

    // On cache le titre le temps que la police soit chargée
    gsap.set(titre, { autoAlpha: 0 });
    await document.fonts.ready;
    if (this.quitte) {
      return;
    }

    this.contexte = gsap.context(() => {
      const split = decouperTexte(titre);
      gsap.set(split.chars, lettresDepart);
      gsap.set(titre, { autoAlpha: 1 });

      // Entrée : la vidéo se dézoome, le titre se forme lettre par lettre,
      // le texte arrive de la gauche et la recherche de la droite
      gsap
        .timeline({ defaults: { ease: 'power4.out' } })
        .from('.hero-video', { scale: 1.3, duration: 2.4, ease: 'power2.out' }, 0)
        .from('.hero .etiquette', { x: -120, opacity: 0, duration: 0.9 }, 0.1)
        .to(split.chars, { yPercent: 0, rotate: 0, opacity: 1, duration: 1, stagger: 0.035 }, 0.3)
        .from('.hero .intro', { x: -100, opacity: 0, duration: 0.9 }, 1.0)
        .from('.hero .recherche', { x: 200, opacity: 0, duration: 1 }, 1.1)
        .from('.hero .chiffres p', { y: 40, opacity: 0, duration: 0.8, stagger: 0.12 }, 1.4)
        .from('.hero .points', { opacity: 0, scale: 0.5, duration: 1.2 }, 0.8);

      // Parallaxe : le contenu du bandeau descend plus lentement et s'efface quand on scrolle
      gsap.to('.hero-contenu', {
        yPercent: 15,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });

      // La bande qui défile s'incline selon la vitesse du scroll
      const incliner = gsap.quickTo('.bande', 'skewX', { duration: 0.6, ease: 'power3' });
      let minuteur: ReturnType<typeof setTimeout>;
      ScrollTrigger.create({
        onUpdate: (self) => {
          incliner(gsap.utils.clamp(-8, 8, self.getVelocity() / -150));
          clearTimeout(minuteur);
          minuteur = setTimeout(() => incliner(0), 120); // on redresse quand le scroll s'arrête
        },
      });
    }, racine);
  }

  ngOnDestroy(): void {
    this.quitte = true;
    this.contexte?.revert();
  }

  ngOnInit(): void {
    this.seanceService.getSeances().subscribe((reponse) => this.seances.set(reponse.member));
    this.salleService.getSalles().subscribe((reponse) => this.salles.set(reponse.member));
    this.avisService.getAvis().subscribe((reponse) => this.avis.set(reponse.member));
    this.coursService.getCours().subscribe((reponse) => this.cours.set(reponse.member));
  }

  // Note moyenne d'une salle (avis publiés), 0 si aucun avis
  noteSalle(salle: SalleInterface): number {
    const liste = this.avis().filter((a) => a.statut === 'publie' && a.salle === '/api/salles/' + salle.id);
    return liste.length === 0 ? 0 : Math.round((liste.reduce((s, a) => s + a.note, 0) / liste.length) * 10) / 10;
  }

  nombreAvisSalle(salle: SalleInterface): number {
    return this.avis().filter((a) => a.statut === 'publie' && a.salle === '/api/salles/' + salle.id).length;
  }

  // Sur quoi porte l'avis : nom de la salle, titre du cours ou "Coach"
  sujetAvis(unAvis: AvisInterface): string {
    if (unAvis.salle) {
      return this.salles().find((s) => '/api/salles/' + s.id === unAvis.salle)?.nom ?? 'Salle';
    }
    if (unAvis.cours) {
      return this.cours().find((c) => '/api/cours/' + c.id === unAvis.cours)?.titre ?? 'Cours';
    }
    return 'Coach';
  }

  // Envoie la recherche vers la page Activités (les filtres sont dans l'URL)
  rechercher(): void {
    const { quoi, ou, quand } = this.rechercheForm.value;
    this.router.navigate(['/activites'], {
      queryParams: { quoi: quoi || null, ou: ou || null, quand: quand || null },
    });
  }

  // Photo de la carte : photo du cours si le coach en a envoyé une, sinon celle de l'activité
  photoSeance(seance: SeanceInterface): string {
    return this.coursService.photo(seance.coursImage, seance.activiteNom, seance.coursTitre);
  }
}
