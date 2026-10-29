import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoursInterface } from './cours-interface';

@Injectable({
  providedIn: 'root',
})
export class CoursService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/cours';

  // API Platform renvoie la liste dans "member"
  getCours(): Observable<{ member: CoursInterface[] }> {
    return this.http.get<{ member: CoursInterface[] }>(this.api);
  }

    // Un seul cours par son id
  getUnCours(id: number): Observable<CoursInterface> {
    return this.http.get<CoursInterface>(`${this.api}/${id}`);
  }

}