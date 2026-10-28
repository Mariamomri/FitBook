import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  erreur = signal('');

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
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.erreur.set('Email ou mot de passe incorrect');
      },
    });
  }
}