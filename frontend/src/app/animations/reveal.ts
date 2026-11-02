import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { animationsActives, decouperTexte, lettresDepart, preparerGsap } from './animer';

// Façons d'apparaître
//   haut   : monte depuis le bas (par défaut)
//   gauche : arrive de la gauche
//   droite : arrive de la droite
//   zoom   : grossit en rebondissant un peu
//   liste  : les enfants arrivent un par un, de la droite
//   texte  : le texte se forme lettre par lettre
type Variante = 'haut' | 'gauche' | 'droite' | 'zoom' | 'liste' | 'texte';

// Utilisation : <h2 appReveal="texte"> ou <div appReveal="gauche" [revealDelay]="0.2">
@Directive({
  selector: '[appReveal]',
})
export class Reveal implements OnInit, OnDestroy {
  private element: HTMLElement = inject(ElementRef).nativeElement;
  private observer?: IntersectionObserver;
  private split?: SplitText;
  private detruit = false;

  variante = input('haut', { alias: 'appReveal' });
  // Petit retard en secondes (pratique pour décaler les cartes d'une liste)
  revealDelay = input(0);

  ngOnInit(): void {
    if (animationsActives()) {
      preparerGsap();
      this.demarrer((this.variante() || 'haut') as Variante);
    }
  }

  private async demarrer(variante: Variante): Promise<void> {
    const el = this.element;
    const delay = this.revealDelay();
    let jouer: () => void;

    if (variante === 'texte') {
      // On cache le texte le temps que la police soit chargée, sinon les lignes seraient mal découpées
      gsap.set(el, { autoAlpha: 0 });
      await document.fonts.ready;
      if (this.detruit) {
        return;
      }
      this.split = decouperTexte(el);
      const split = this.split;
      gsap.set(split.chars, lettresDepart);
      gsap.set(el, { autoAlpha: 1 });
      jouer = () =>
        gsap.to(split.chars, {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 0.9,
          delay,
          ease: 'power4.out',
          stagger: 0.03,
          onComplete: () => split.revert(), // on remet le texte normal à la fin
        });
    } else if (variante === 'liste') {
      const enfants = Array.from(el.children);
      gsap.set(enfants, { opacity: 0, x: 100 });
      jouer = () =>
        gsap.to(enfants, { opacity: 1, x: 0, duration: 0.8, delay, stagger: 0.12, ease: 'power3.out', clearProps: 'opacity,transform' });
    } else if (variante === 'zoom') {
      gsap.set(el, { opacity: 0, scale: 0.85, y: 40 });
      jouer = () =>
        gsap.to(el, { opacity: 1, scale: 1, y: 0, duration: 0.9, delay, ease: 'back.out(1.4)', clearProps: 'opacity,transform' });
    } else {
      // haut, gauche ou droite : même animation, seule la direction change
      const depart = variante === 'gauche' ? { x: -160 } : variante === 'droite' ? { x: 160 } : { y: 60 };
      gsap.set(el, { opacity: 0, ...depart });
      jouer = () =>
        gsap.to(el, { opacity: 1, x: 0, y: 0, duration: 1, delay, ease: 'power4.out', clearProps: 'opacity,transform' });
    }

    // On joue l'animation quand l'élément arrive à l'écran
    this.observer = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          jouer();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.detruit = true;
    this.observer?.disconnect();
    gsap.killTweensOf(this.element);
    this.split?.revert();
  }
}
