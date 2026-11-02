// Données envoyées à POST /api/contact (mêmes champs que le schéma JSON config/schemas/contact.json)
export interface ContactInterface {
  sujet: string;
  nom: string;
  email: string;
  profil: string;
  specialite?: string;
  message: string;
  rgpd: boolean;
}

// Réponse du serveur : message + erreurs par champ (seulement en cas de 422)
export interface ContactReponseInterface {
  message: string;
  erreurs?: Record<string, string>;
}
