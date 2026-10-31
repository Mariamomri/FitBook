export interface CoachInterface {
  id?: number;
  nomComplet: string;
  biographie: string;
  anneesExperience: number;
  tarif: string; // DECIMAL dans Symfony : l'API renvoie du texte
  certifications?: string; // peut être vide (nullable)
  langues: string;
  imageName?: string | null; // nom du fichier photo (null = pas de photo)
  user?: string; // lien vers le compte du coach, ex. "/api/users/12"
}
