import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth-service';
import { environment } from '../../environments/environment';

// Les favoris de l'utilisateur : des liens vers les salles, cours et coachs ("/api/salles/12")
export interface FavorisInterface {
  favoriSalles: string[];
  favoriCours: string[];
  favoriCoachs: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FavoriService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private api = environment.apiUrl + '/api/users/';

  // Gardés dans un signal : tous les cœurs du site se mettent à jour en même temps
  readonly favoris = signal<FavorisInterface>({ favoriSalles: [], favoriCours: [], favoriCoachs: [] });
  private idUtilisateur: number | null = null;

  // Les favoris sont dans le compte de l'utilisateur (GET /api/users/{id})
  charger(): void {
    if (!this.authService.connecte()) {
      return;
    }
    this.authService.getMoi().subscribe((moi) => {
      this.idUtilisateur = moi.id!;
      this.http.get<FavorisInterface>(this.api + moi.id).subscribe((user) =>
        this.favoris.set({
          favoriSalles: user.favoriSalles,
          favoriCours: user.favoriCours,
          favoriCoachs: user.favoriCoachs,
        }),
      );
    });
  }

  estFavori(type: keyof FavorisInterface, lien: string): boolean {
    return this.favoris()[type].includes(lien);
  }

  // Ajoute ou retire un favori puis envoie la nouvelle liste à Symfony (PATCH merge-patch)
  basculer(type: keyof FavorisInterface, lien: string): void {
    if (this.idUtilisateur === null) {
      return;
    }
    const liste = this.favoris()[type];
    const nouvelleListe = liste.includes(lien) ? liste.filter((l) => l !== lien) : [...liste, lien];

    const headers = new HttpHeaders({ 'Content-Type': 'application/merge-patch+json' });
    this.http.patch(this.api + this.idUtilisateur, { [type]: nouvelleListe }, { headers }).subscribe(() =>
      this.favoris.update((favoris) => ({ ...favoris, [type]: nouvelleListe })),
    );
  }
}
