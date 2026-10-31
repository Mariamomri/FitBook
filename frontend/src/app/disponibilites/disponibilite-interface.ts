export interface DisponibiliteInterface {
  id?: number;
  jour: string; // lundi, mardi...
  heureDebut: string; // Symfony renvoie une date complète, on n'affiche que l'heure
  heureFin: string;
  coach: string; // lien vers la fiche du coach, ex. "/api/coaches/12"
}
