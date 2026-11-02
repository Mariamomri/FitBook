export interface SeanceInterface {
  id: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
  coursTitre: string;
  salleNom: string;
  placesRestantes: number;
  prix: string;
  coachNom?: string; // une séance peut ne pas avoir de coach
  activiteNom: string;
  ville: string;
  coursId: number;
  coursImage?: string | null; // photo du cours (null = photo de l'activité)
}
