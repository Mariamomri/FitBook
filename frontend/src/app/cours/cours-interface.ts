export interface CoursInterface {
  id?: number;
  titre: string;
  description: string;
  niveau: string;
  capacite: number;
  prix: string;
  salleNom: string;
  activiteNom: string;
  coachNom?: string; // un cours peut ne pas avoir de coach
}
