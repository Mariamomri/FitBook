// Photos choisies pour certains cours (d'après leur titre).
// Les autres cours gardent la photo de leur activité.
export function photoDuCours(titre: string | undefined | null): string | undefined {
  // on enlève les accents et les majuscules : « Musculation Débutants » = « musculation debutants »
  const t = (titre ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (t.includes('musculation') && t.includes('debutant')) {
    return 'img/musculation-debutants.jpg';
  }
  return undefined;
}
