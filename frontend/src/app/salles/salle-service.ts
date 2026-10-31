import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalleInterface } from './salle-interface';

@Injectable({
  providedIn: 'root',
})
export class SalleService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/salles';

  // API Platform renvoie la liste dans "member"
  getSalles(): Observable<{ member: SalleInterface[] }> {
    return this.http.get<{ member: SalleInterface[] }>(this.api);
  }

  // Photo envoyée par le gestionnaire, ou image par défaut si la salle n'en a pas
  photo(salle: SalleInterface): string {
    return salle.imageName ? 'https://127.0.0.1:8000/images/salles/' + salle.imageName : 'img/gym1.jpg';
  }
}
