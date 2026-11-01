import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../auth-service';

// Les deux mots de passe doivent être identiques (validateur sur le groupe)
function memesMotsDePasse(groupe: AbstractControl): ValidationErrors | null {
  const motDePasse = groupe.get('password')?.value;
  const confirmation = groupe.get('confirmation')?.value;
  return motDePasse === confirmation ? null : { differents: true };
}

@Component({
  selector: 'app-nouveau-mot-de-passe',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './nouveau-mot-de-passe.html',
  styleUrl: './nouveau-mot-de-passe.css',
})
export class NouveauMotDePasse {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  // Le token arrive dans l'adresse : /nouveau-mot-de-passe?token=...
  token = this.route.snapshot.queryParamMap.get('token') ?? '';

  succes = signal('');
  erreur = signal('');
  // Texte tapé, pour la barre de force
  saisie = signal('');

  motDePasseForm = new FormGroup(
    {
      // 8 caractères minimum, 1 majuscule et 1 chiffre (même règle que Symfony)
      password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)]),
      confirmation: new FormControl('', Validators.required),
    },
    { validators: memesMotsDePasse },
  );

  // Nombre de règles respectées (0 à 4) pour allumer les segments de la barre
  force = computed(() => {
    const texte = this.saisie();
    return [texte.length >= 8, /[A-Z]/.test(texte), /\d/.test(texte), texte.length >= 12].filter((ok) => ok).length;
  });

  enregistrer(): void {
    if (this.motDePasseForm.invalid) {
      this.motDePasseForm.markAllAsTouched();
      return;
    }
    this.erreur.set('');

    this.authService.nouveauMotDePasse(this.token, this.motDePasseForm.value.password!).subscribe({
      next: (reponse) => this.succes.set(reponse.message),
      // 400 : lien expiré ou déjà utilisé / 422 : mot de passe trop faible
      error: (err) => this.erreur.set(err.error?.message ?? 'Erreur serveur, réessayez plus tard.'),
    });
  }
}
