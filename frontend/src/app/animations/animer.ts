import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// On anime seulement dans un vrai navigateur, et si l'utilisateur n'a pas demandé « moins d'animations »
export function animationsActives(): boolean {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function' ||
    typeof IntersectionObserver === 'undefined'
  ) {
    return false;
  }
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Les plugins GSAP ne sont enregistrés qu'une seule fois
let pret = false;
export function preparerGsap(): void {
  if (!pret) {
    gsap.registerPlugin(ScrollTrigger, SplitText);
    pret = true;
  }
}

// Découpe un texte en lettres. Chaque ligne est « masquée » : les lettres sortent du bas de la ligne
export function decouperTexte(element: HTMLElement): SplitText {
  const split = SplitText.create(element, { type: 'lines,chars', mask: 'lines' });
  // Les titres sont en italique avec peu d'interligne : on agrandit un peu le masque pour ne pas couper les lettres
  gsap.set(split.masks, {
    paddingTop: '0.12em',
    marginTop: '-0.12em',
    paddingBottom: '0.12em',
    marginBottom: '-0.12em',
    paddingRight: '0.1em',
    marginRight: '-0.1em',
  });
  return split;
}

// Position de départ des lettres (en bas, un peu penchées, invisibles)
export const lettresDepart = { yPercent: 120, rotate: 10, opacity: 0 };
