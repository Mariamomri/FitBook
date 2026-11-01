// Carte de membre du sportif connecté (réponse de /api/me/carte)
export interface CarteMembreInterface {
  id: number;
  numero: string;
  dateEmission: string; // "2026-11-01"
  dateExpiration: string;
  statut: string; // active, expiree ou suspendue
}

// Carte telle que l'admin la reçoit d'API Platform (lien vers le sportif)
export interface CarteMembreAdminInterface {
  id: number;
  numeroAffiliation: string;
  dateEmission: string;
  dateExpiration: string;
  statut: string;
  user: string; // ex. "/api/users/12"
}
