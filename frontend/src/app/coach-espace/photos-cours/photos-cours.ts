import { Component, computed, inject, input, signal } from '@angular/core';
import { CoursService } from '../../cours/cours-service';
import { CoursInterface } from '../../cours/cours-interface';

// Le coach choisit la photo de chacun de ses cours (visible sur l'accueil, la recherche et la fiche du cours)
@Component({
  selector: 'app-photos-cours',
  templateUrl: './photos-cours.html',
  styleUrls: ['../../admin/admin-commun.css', './photos-cours.css'],
})
export class PhotosCours {
  coursService = inject(CoursService);

  // Les cours qu'il anime (donnés par la dashboard)
  cours = input.required<CoursInterface[]>();

  // Photos envoyées pendant la visite : id du cours -> nom du fichier
  nouvellesPhotos = signal<Record<number, string>>({});
  erreur = signal('');
  succes = signal('');

  // Liste affichée avec la photo à jour
  liste = computed(() =>
    this.cours().map((c) => ({
      ...c,
      photo: this.coursService.photo(this.nouvellesPhotos()[c.id!] ?? c.imageName, c.activiteNom, c.titre),
    })),
  );

  // Envoi de la photo dès qu'un fichier est choisi
  choisirPhoto(cours: CoursInterface, evenement: Event): void {
    const fichier = (evenement.target as HTMLInputElement).files?.[0];
    if (!fichier) {
      return;
    }
    this.erreur.set('');
    this.succes.set('');
    this.coursService.envoyerPhoto(cours.id!, fichier).subscribe({
      next: (reponse) => {
        this.nouvellesPhotos.update((photos) => ({ ...photos, [cours.id!]: reponse.imageName }));
        this.succes.set(`Photo du cours « ${cours.titre} » enregistrée.`);
      },
      // 403 : pas son cours, 422 : mauvais format ou fichier trop lourd
      error: (err) => this.erreur.set(err.error?.message ?? "Erreur lors de l'envoi de la photo"),
    });
  }
}
