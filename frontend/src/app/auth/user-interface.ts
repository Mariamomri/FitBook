export interface UserInterface {
  id?: number;
  email: string;
  roles?: string[];
  firstname: string;
  lastname: string;
  phone?: string;
  accentColor: string;
  isActive?: boolean;
  isVerified?: boolean;
  plainPassword?: string; // envoyé seulement à l'inscription ou au changement de mot de passe, jamais renvoyé par l'API
}
