import { Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth-service';

// Vérifie que le mot de passe et sa confirmation sont identiques
function motsDePasseIdentiques(formulaire: AbstractControl): ValidationErrors | null {
  const motDePasse = formulaire.get('plainPassword')?.value;
  const confirmation = formulaire.get('confirmation')?.value;
  return motDePasse === confirmation ? null : { differents: true };
}

@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inscription.html',
  styleUrl: './inscription.css',
})
export class Inscription {
  private authService = inject(AuthService);
  erreur = signal('');
  succes = signal('');

  // Afficher / cacher les mots de passe (bouton œil)
  voirMotDePasse = signal(false);
  voirConfirmation = signal(false);

  // Couleurs du site proposées (comme sur la maquette)
  couleurs = [
    { nom: 'vert', libelle: 'Vert', code: '#a6ff00' },
    { nom: 'orange', libelle: 'Orange', code: '#ff6b00' },
    { nom: 'jaune', libelle: 'Jaune', code: '#ffd600' },
    { nom: 'bleu', libelle: 'Bleu', code: '#2e86de' },
    { nom: 'rose', libelle: 'Rose', code: '#ff1493' },
    { nom: 'rouge', libelle: 'Rouge', code: '#ee5253' },
  ];

  // Mêmes règles que les Assert de l'entité User côté Symfony
  inscriptionForm = new FormGroup(
    {
      firstname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
      lastname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      plainPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmation: new FormControl('', Validators.required),
      accentColor: new FormControl('vert', Validators.required),
      cgu: new FormControl(false, Validators.requiredTrue),
    },
    { validators: motsDePasseIdentiques },
  );

  // Force du mot de passe : 1 point par règle respectée (de 0 à 4)
  force(): number {
    const mdp = this.inscriptionForm.value.plainPassword ?? '';
    let points = 0;
    if (mdp.length >= 8) points++;
    if (/[A-Z]/.test(mdp)) points++;
    if (/[0-9]/.test(mdp)) points++;
    if (/[^A-Za-z0-9]/.test(mdp)) points++;
    return points;
  }

  libelleForce(): string {
    return ['', 'Faible', 'Moyen', 'Bon', 'Fort'][this.force()];
  }

  inscription() {
    this.erreur.set('');
    this.succes.set('');

    if (this.inscriptionForm.invalid) {
      this.inscriptionForm.markAllAsTouched(); // affiche les messages sous les champs
      this.erreur.set('Veuillez remplir correctement les champs');
      return;
    }

    const { firstname, lastname, email, plainPassword, accentColor } = this.inscriptionForm.value;

    this.authService
      .inscription({
        firstname: firstname!,
        lastname: lastname!,
        email: email!,
        plainPassword: plainPassword!,
        accentColor: accentColor!, // nom de la couleur choisie (ex. "vert")
      })
      .subscribe({
        next: () => {
          this.succes.set('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
          this.inscriptionForm.reset({ accentColor: 'vert', cgu: false });
        },
        error: (err) => {
          // 422 = validation Symfony (ex. email déjà utilisé)
          if (err.status === 422) {
            this.erreur.set('Un compte existe déjà avec cet email ou les données sont invalides');
          } else {
            this.erreur.set('Erreur serveur, réessayez plus tard');
          }
        },
      });
  }
}
