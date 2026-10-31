export interface ReservationInterface {
  id?: number;
  numero: string;
  statut: string;
  cours: string;
  salle: string;
  dateDebut: string;
  dateFin: string;
}

// Réservation telle que l'admin la reçoit d'API Platform (liens vers le sportif et la séance)
export interface ReservationAdminInterface {
  id: number;
  numero: string;
  statut: string;
  user: string;
  seance: string;
  avis?: string[]; // avis déjà laissés sur cette réservation
}
