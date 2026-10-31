import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CoachService } from '../../coach/coach-service';
import { CoachInterface } from '../../coach/coach-interface';
import { AdminService } from '../../admin/admin-service';

@Component({
  selector: 'app-profil-pro',
  imports: [ReactiveFormsModule],
  templateUrl: './profil-pro.html',
  styleUrls: ['../../admin/admin-commun.css', './profil-pro.css'],
})
export class ProfilPro implements OnInit {
  private coachService = inject(CoachService);
  private adminService = inject(AdminService);

  // Sa fiche coach (donnée par la dashboard)
  coach = input.required<CoachInterface>();

  imageName = signal<string | null | undefined>(null);

  // Adresse de la photo (mise à jour tout de suite après un envoi)
  photo = computed(() => this.coachService.photo({ ...this.coach(), imageName: this.imageName() }));
  erreur = signal('');
  succes = signal('');

  // Mêmes champs que l'entité Coach côté Symfony
  profilForm = new FormGroup({
    biographie: new FormControl('', Validators.required),
    anneesExperience: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    tarif: new FormControl('', Validators.required),
    langues: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    certifications: new FormControl(''),
  });

  // On remplit le formulaire avec sa fiche actuelle
  ngOnInit(): void {
    const coach = this.coach();
    this.imageName.set(coach.imageName);
    this.profilForm.patchValue({
      biographie: coach.biographie,
      anneesExperience: coach.anneesExperience,
      tarif: coach.tarif,
      langues: coach.langues,
      certifications: coach.certifications ?? '',
    });
  }

  enregistrer(): void {
    this.erreur.set('');
    this.succes.set('');
    if (this.profilForm.invalid) {
      this.profilForm.markAllAsTouched();
      this.erreur.set('Veuillez remplir correctement les champs');
      return;
    }

    const valeurs = this.profilForm.value;
    // tarif est un DECIMAL côté Symfony : on l'envoie en texte
    const donnees: Partial<CoachInterface> = {
      biographie: valeurs.biographie!,
      anneesExperience: valeurs.anneesExperience!,
      tarif: String(valeurs.tarif),
      langues: valeurs.langues!,
      certifications: valeurs.certifications || undefined,
    };

    this.coachService.modifierCoach(this.coach().id!, donnees).subscribe({
      next: () => this.succes.set('Profil professionnel enregistré.'),
      error: (err) => this.erreur.set(this.adminService.messageErreur(err)),
    });
  }

  // Envoi de la photo dès qu'un fichier est choisi
  choisirPhoto(evenement: Event): void {
    const fichier = (evenement.target as HTMLInputElement).files?.[0];
    if (!fichier) {
      return;
    }
    this.erreur.set('');
    this.coachService.envoyerPhoto(this.coach().id!, fichier).subscribe({
      next: (reponse) => {
        this.imageName.set(reponse.imageName);
        this.succes.set('Photo enregistrée.');
      },
      // 422 : mauvais format ou fichier trop lourd
      error: (err) => this.erreur.set(err.error?.message ?? "Erreur lors de l'envoi de la photo"),
    });
  }
}
