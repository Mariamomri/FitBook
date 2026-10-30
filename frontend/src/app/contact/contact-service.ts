import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactInterface, ContactReponseInterface } from './contact-interface';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private http = inject(HttpClient);
  private api = 'https://127.0.0.1:8000/api/contact';

  // Envoie le formulaire, Symfony le valide avec le schéma JSON
  envoyer(contact: ContactInterface): Observable<ContactReponseInterface> {
    return this.http.post<ContactReponseInterface>(this.api, contact);
  }
}
