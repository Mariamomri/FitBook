export interface SalleInterface {
  id?: number;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  description: string;
  telephone: string;
  capacite: number;
  equipements?: string;
  imageName?: string | null; // nom du fichier photo (null = pas de photo)
  latitude?: string | null; // DECIMAL dans Symfony : l'API renvoie du texte
  longitude?: string | null;
}
