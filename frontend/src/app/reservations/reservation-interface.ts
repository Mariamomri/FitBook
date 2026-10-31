export interface ReservationInterface {
  id?: number;
  numero: string;
  statut: string;
  cours: string;
  salle: string;
  dateDebut: string;
  dateFin: string;
}

// Réservation reçue par une salle ou un coach (nom du sportif déjà calculé par Symfony)
export interface ReservationRecueInterface {
  id: number;
  numero: string;
  statut: string;
  sportif: string;
  email: string;
  cours: string;
  salle: string;
  dateDebut: string;
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
