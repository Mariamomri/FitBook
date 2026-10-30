import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ContactService } from './contact-service';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  private contactService = inject(ContactService);
  erreur = signal('');
  succes = signal('');

  // Erreurs renvoyées par Symfony (422) : un message par champ
  erreursServeur = signal<Record<string, string>>({});

  // Mêmes règles que le schéma JSON côté Symfony
  contactForm = new FormGroup({
    sujet: new FormControl('question', Validators.required),
    nom: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
      Validators.pattern(/^[A-ZÀ-Ÿ][a-zà-ÿ]+([-\s'][A-ZÀ-Ÿa-zà-ÿ]+)*$/),
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
    ]),
    profil: new FormControl('sportif', Validators.required),
    specialite: new FormControl('', Validators.maxLength(100)),
    message: new FormControl('', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]),
    rgpd: new FormControl(false, Validators.requiredTrue),
  });

  // Vrai si le champ a été touché et ne respecte pas les règles
  invalide(champ: string): boolean {
    const controle = this.contactForm.get(champ);
    return !!controle && controle.touched && controle.invalid;
  }

  envoyer() {
    this.erreur.set('');
    this.succes.set('');
    this.erreursServeur.set({});

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched(); // affiche les messages sous les champs
      this.erreur.set('Veuillez remplir correctement les champs');
      return;
    }

    const valeurs = this.contactForm.value;

    this.contactService
      .envoyer({
        sujet: valeurs.sujet!,
        nom: valeurs.nom!,
        email: valeurs.email!,
        profil: valeurs.profil!,
        specialite: valeurs.specialite || undefined, // champ facultatif : pas envoyé s'il est vide
        message: valeurs.message!,
        rgpd: valeurs.rgpd!,
      })
      .subscribe({
        next: (reponse) => {
          this.succes.set(reponse.message);
          this.contactForm.reset({ sujet: 'question', profil: 'sportif', rgpd: false });
        },
        error: (err) => {
          // 422 = le schéma JSON a refusé des champs
          if (err.status === 422) {
            this.erreursServeur.set(err.error.erreurs ?? {});
            this.erreur.set(err.error.message);
          } else {
            this.erreur.set('Erreur serveur, réessayez plus tard');
          }
        },
      });
  }
}
