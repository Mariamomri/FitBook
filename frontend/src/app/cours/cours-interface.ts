export interface CoursInterface {
  id?: number;
  titre: string;
  description: string;
  niveau: string;
  capacite: number;
  prix: string;
  salleNom?: string;
  activiteNom?: string;
  coachNom?: string; // un cours peut ne pas avoir de coach
  salle?: string; // liens vers les autres entités, ex. "/api/salles/12"
  activite?: string;
  coach?: string | null;
  imageName?: string | null; // photo envoyée par le coach ou le gestionnaire
}
