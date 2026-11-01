import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-verifiez-email',
  imports: [RouterLink],
  templateUrl: './verifiez-email.html',
  styleUrl: './verifiez-email.css',
})
export class VerifiezEmail {
  private route = inject(ActivatedRoute);

  // Adresse envoyée par la page d'inscription : /verifiez-email?email=...
  email = this.route.snapshot.queryParamMap.get('email') ?? '';
}
