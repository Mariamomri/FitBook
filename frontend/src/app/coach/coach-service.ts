import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CoachInterface } from './coach-interface';

@Injectable({
  providedIn: 'root',
})
export class CoachService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/coaches';

  // API Platform renvoie la liste dans "member"
  getCoaches(): Observable<{ member: CoachInterface[] }> {
    return this.http.get<{ member: CoachInterface[] }>(this.api);
  }

  // Photo envoyée par le coach, ou avatar par défaut s'il n'en a pas
  photo(coach: CoachInterface): string {
    return coach.imageName ? 'https://127.0.0.1:8000/images/coaches/' + coach.imageName : 'img/avatar-defaut.svg';
  }
}
