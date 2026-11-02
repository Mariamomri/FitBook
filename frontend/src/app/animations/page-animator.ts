import { Injectable } from '@angular/core';
import { gsap } from 'gsap';
import { animationsActives, decouperTexte, lettresDepart, preparerGsap } from './animer';

// Anime automatiquement les pages (sauf l'accueil, qui a ses propres animations) :
//  - les titres h1 se forment lettre par lettre
//  - fil d'Ariane, petits titres et filtres arrivent de la gauche
//  - cartes, lignes de résultats et articles arrivent de la droite, l'un après l'autre
//  - formulaires et barres de recherche montent depuis le bas
// Chaque élément est animé une seule fois, quand il arrive à l'écran.
@Injectable({
  providedIn: 'root',
})
export class PageAnimator {
  private observer?: IntersectionObserver;
  private actions = new Map<Element, (retard: number) => void>();

  private readonly depuisGauche = '.fil, .bandeau > p, .eyebrow, aside, .filtres';
  private readonly depuisDroite = 'article, .carte, .ligne';
  private readonly depuisBas = '.recherche, form, .tableau, table';

  demarrer(zone: HTMLElement): void {
    if (!animationsActives()) {
      return;
    }
    preparerGsap();

    this.observer = new IntersectionObserver((entrees) => this.jouer(entrees), { threshold: 0.1 });

    // Dès qu'un élément est ajouté dans la page (changement de page, résultats qui arrivent...), on le prépare
    new MutationObserver((lots) => {
      for (const lot of lots) {
        lot.addedNodes.forEach((noeud) => {
          if (noeud instanceof HTMLElement) {
            this.preparer(noeud);
          }
        });
      }
    }).observe(zone, { childList: true, subtree: true });
  }

  private preparer(racine: HTMLElement): void {
    if (racine.closest('app-accueil')) {
      return; // l'accueil gère ses propres animations
    }
    const tous = [racine, ...Array.from(racine.querySelectorAll<HTMLElement>('*'))];
    for (const el of tous) {
      if (el.dataset['anim'] || el.hasAttribute('appreveal')) {
        continue;
      }
      if (el.matches('h1')) {
        this.preparerTitre(el);
      } else if (el.matches(this.depuisGauche)) {
        this.preparerMouvement(el, { x: -90 });
      } else if (el.matches(this.depuisDroite)) {
        this.preparerMouvement(el, { x: 90 });
      } else if (el.matches(this.depuisBas)) {
        this.preparerMouvement(el, { y: 50 });
      }
    }
  }

  // Cache l'élément et l'animera quand il sera visible
  private preparerMouvement(el: HTMLElement, depart: { x?: number; y?: number }): void {
    el.dataset['anim'] = '1';
    gsap.set(el, { opacity: 0, ...depart });
    this.actions.set(el, (retard) =>
      gsap.to(el, { opacity: 1, x: 0, y: 0, duration: 0.9, delay: retard, ease: 'power4.out', clearProps: 'opacity,transform' }),
    );
    this.observer?.observe(el);
  }

  private async preparerTitre(titre: HTMLElement): Promise<void> {
    titre.dataset['anim'] = '1';
    gsap.set(titre, { autoAlpha: 0 });
    await document.fonts.ready;
    if (!titre.isConnected) {
      return;
    }
    const split = decouperTexte(titre);
    gsap.set(split.chars, lettresDepart);
    gsap.set(titre, { autoAlpha: 1 });
    this.actions.set(titre, (retard) =>
      gsap.to(split.chars, {
        yPercent: 0,
        rotate: 0,
        opacity: 1,
        duration: 0.9,
        delay: retard,
        ease: 'power4.out',
        stagger: 0.03,
        onComplete: () => split.revert(),
      }),
    );
    this.observer?.observe(titre);
  }

  // Joue les animations des éléments qui viennent d'apparaître (en les décalant un peu)
  private jouer(entrees: IntersectionObserverEntry[]): void {
    let rang = 0;
    for (const entree of entrees) {
      if (!entree.isIntersecting) {
        continue;
      }
      const action = this.actions.get(entree.target);
      if (action) {
        action(Math.min(rang * 0.08, 0.6));
        rang++;
      }
      this.actions.delete(entree.target);
      this.observer?.unobserve(entree.target);
    }
  }
}
