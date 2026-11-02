import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../environments/environment';

// En ligne, l'API est dans un sous-dossier (https://mariam.alwaysdata.net/Fitbook).
// Symfony renvoie alors des IRI "/Fitbook/api/coaches/12", mais Angular compare avec "/api/coaches/12".
// Cet intercepteur enlève le sous-dossier des réponses de l'API. En local, le préfixe est vide : rien ne change.
export const prefixeApi = new URL(environment.apiUrl).pathname.replace(/\/$/, '');

// Parcourt la réponse (objets, tableaux, textes) et remplace "/Fitbook/api/..." par "/api/..."
export function enleverPrefixe(valeur: unknown, prefixe: string): unknown {
  if (typeof valeur === 'string') {
    return valeur.startsWith(prefixe + '/api/') ? valeur.slice(prefixe.length) : valeur;
  }
  if (Array.isArray(valeur)) {
    return valeur.map((element) => enleverPrefixe(element, prefixe));
  }
  if (valeur && typeof valeur === 'object') {
    const copie: Record<string, unknown> = {};
    for (const [cle, contenu] of Object.entries(valeur)) {
      copie[cle] = enleverPrefixe(contenu, prefixe);
    }
    return copie;
  }
  return valeur;
}

export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
  // Pas de sous-dossier (local) ou requête qui ne va pas vers l'API : on ne touche à rien
  if (!prefixeApi || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  return next(req).pipe(
    map((evenement) =>
      evenement instanceof HttpResponse && evenement.body
        ? evenement.clone({ body: enleverPrefixe(evenement.body, prefixeApi) })
        : evenement,
    ),
  );
};
