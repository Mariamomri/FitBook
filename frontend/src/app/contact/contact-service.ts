import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactInterface, ContactReponseInterface } from './contact-interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/api/contact';

  // Envoie le formulaire, Symfony le valide avec le schéma JSON
  envoyer(contact: ContactInterface): Observable<ContactReponseInterface> {
    return this.http.post<ContactReponseInterface>(this.api, contact);
  }
}
