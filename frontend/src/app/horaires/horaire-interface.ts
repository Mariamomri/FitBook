export interface HoraireInterface {
  id?: number;
  jour: string; // lundi, mardi...
  heureOuverture: string; // Symfony renvoie une date complète, on n'affiche que l'heure
  heureFermeture: string;
  salle: string; // lien vers la salle, ex. "/api/salles/12"
}
