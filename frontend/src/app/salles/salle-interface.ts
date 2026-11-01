export interface SalleInterface {
  id?: number;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  description: string;
  telephone: string;
  capacite: number;
  equipements?: string | null; // peut être vide (nullable dans Symfony)
  imageName?: string | null; // nom du fichier photo (null = pas de photo)
  latitude?: string | null; // DECIMAL dans Symfony : l'API renvoie du texte
  longitude?: string | null;
  gestionnaire?: string; // lien vers le compte du gestionnaire, ex. "/api/users/12"
}
