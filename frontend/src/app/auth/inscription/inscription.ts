import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth-service';

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

  // Mêmes règles que les Assert de l'entité User côté Symfony
  inscriptionForm = new FormGroup({
    firstname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    lastname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl(''),
    plainPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  inscription() {
    this.erreur.set('');
    this.succes.set('');

    if (this.inscriptionForm.invalid) {
      this.erreur.set('Veuillez remplir correctement les champs');
      return;
    }

    const { firstname, lastname, email, phone, plainPassword } = this.inscriptionForm.value;

    this.authService
      .inscription({
        firstname: firstname!,
        lastname: lastname!,
        email: email!,
        phone: phone || undefined, // champ facultatif
        plainPassword: plainPassword!,
        accentColor: '#B7F000', // couleur par défaut (vert)
      })
      .subscribe({
        next: () => {
          this.succes.set('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
          this.inscriptionForm.reset();
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