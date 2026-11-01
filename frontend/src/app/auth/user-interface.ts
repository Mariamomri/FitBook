export interface UserInterface {
  id?: number;
  email: string;
  roles?: string[];
  firstname: string;
  lastname: string;
  phone?: string;
  accentColor: string;
  imageName?: string | null; // nom du fichier photo (null = pas de photo)
  isActive?: boolean; // envoyé par l'admin pour activer / suspendre un compte
  isVerified?: boolean;
  active?: boolean; // renvoyé par l'API (getter isActive() côté Symfony)
  verified?: boolean;
  plainPassword?: string; // envoyé seulement à l'inscription ou au changement de mot de passe, jamais renvoyé par l'API
}
