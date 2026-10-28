import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActiviteInterface } from './activite-interface';

@Injectable({
  providedIn: 'root',
})
export class ActiviteService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/activites';

  // API Platform renvoie la liste dans "member"
  getActivites(): Observable<{ member: ActiviteInterface[] }> {
    return this.http.get<{ member: ActiviteInterface[] }>(this.api);
  }
}
