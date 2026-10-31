export interface AvisInterface {
  id?: number;
  note: number;
  commentaire: string;
  statut: string; // en_attente, publie ou refuse
  reservation: string; // lien vers la réservation, ex. "/api/reservations/12"
  salle?: string | null; // l'avis porte sur une salle, un coach ou un cours
  coach?: string | null;
  cours?: string | null;
  auteur?: string; // "Mariam O." (calculé par Symfony, lecture seule)
  auteurImage?: string | null;
  createdAt?: string;
}
