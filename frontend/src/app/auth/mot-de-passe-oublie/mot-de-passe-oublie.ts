import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth-service';

@Component({
  selector: 'app-mot-de-passe-oublie',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './mot-de-passe-oublie.html',
  styleUrl: './mot-de-passe-oublie.css',
})
export class MotDePasseOublie {
  private authService = inject(AuthService);

  succes = signal('');
  erreur = signal('');
  envoiEnCours = signal(false);

  oublieForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  envoyer(): void {
    if (this.oublieForm.invalid) {
      this.oublieForm.markAllAsTouched();
      return;
    }
    this.erreur.set('');
    this.envoiEnCours.set(true);

    this.authService.motDePasseOublie(this.oublieForm.value.email!).subscribe({
      next: (reponse) => {
        this.envoiEnCours.set(false);
        this.succes.set(reponse.message);
      },
      error: (err) => {
        this.envoiEnCours.set(false);
        this.erreur.set(err.error?.message ?? 'Erreur serveur, réessayez plus tard.');
      },
    });
  }
}
