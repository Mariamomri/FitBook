import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth-service';
import { ThemeService } from '../../theme/theme-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private themeService = inject(ThemeService);
  erreur = signal('');

  // Symfony redirige vers /login?verified=1 après la confirmation de l'email
  emailConfirme = this.route.snapshot.queryParamMap.get('verified') === '1';

  // Le formulaire est créé dans le TypeScript, avec ses règles de validation
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  login() {
    if (this.loginForm.invalid) {
      this.erreur.set('Veuillez remplir correctement les champs');
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      next: (reponse) => {
        this.authService.saveToken(reponse.token);
        // On applique tout de suite la couleur enregistrée dans son compte
        this.authService.getMoi().subscribe((moi) => this.themeService.appliquer(moi.accentColor));
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.erreur.set('Email ou mot de passe incorrect');
      },
    });
  }
}
