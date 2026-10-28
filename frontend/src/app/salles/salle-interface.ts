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
}
