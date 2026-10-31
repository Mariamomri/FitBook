import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AvisService } from '../avis-service';
import { AvisInterface } from '../avis-interface';
import { ReservationService } from '../../reservations/reservation-service';
import { ReservationInterface } from '../../reservations/reservation-interface';
import { AuthService } from '../../auth/auth-service';
import { ProfilService } from '../../profil/profil-service';

@Component({
  selector: 'app-donner-avis',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './donner-avis.html',
  styleUrl: './donner-avis.css',
})
export class DonnerAvis implements OnInit {
  avisService = inject(AvisService);
  private reservationService = inject(ReservationService);
  authService = inject(AuthService);
  profilService = inject(ProfilService);

  // Ce qu'on note : une salle, un cours ou un coach, et son lien ("/api/salles/12")
  cible = input.required<'salle' | 'cours' | 'coach'>();
  lien = input.required<string>();

  mesReservations = signal<ReservationInterface[]>([]);
  avis = signal<AvisInterface[]>([]);
  note = signal(5);
  succes = signal('');
  erreur = signal('');
  // Avis en cours de modification (null = on écrit un nouvel avis)
  idEnModification = signal<number | null>(null);
  // Avis dont on demande la confirmation de suppression
  idASupprimer = signal<number | null>(null);
  // false = on n'affiche que les 3 premiers avis
  toutAfficher = signal(false);

  avisForm = new FormGroup({
    commentaire: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]),
  });

  // Liens de mes réservations ("/api/reservations/12") pour reconnaître mes avis
  mesLiens = computed(() => this.mesReservations().map((r) => '/api/reservations/' + r.id));

  // Avis publiés sur cette salle / ce cours / ce coach : ils comptent dans la note
  avisPublies = computed(() => this.avis().filter((a) => a.statut === 'publie' && a[this.cible()] === this.lien()));

  // Liste affichée : les avis publiés + mes avis (même en attente), le plus récent d'abord
  avisAffiches = computed(() =>
    this.avis()
      .filter((a) => a[this.cible()] === this.lien() && (a.statut === 'publie' || this.estAMoi(a)))
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '')),
  );
  avisVisibles = computed(() => (this.toutAfficher() ? this.avisAffiches() : this.avisAffiches().slice(0, 3)));

  noteMoyenne = computed(() => {
    const liste = this.avisPublies();
    return liste.length === 0 ? 0 : Math.round((liste.reduce((s, a) => s + a.note, 0) / liste.length) * 10) / 10;
  });

  noteArrondie = computed(() => Math.round(this.noteMoyenne()));

  // Réservations confirmées et déjà passées qui concernent cette salle / ce cours / ce coach
  reservationsLiees = computed(() => {
    const id = Number(this.lien().split('/').pop());
    return this.mesReservations().filter((r) => {
      const idLie = this.cible() === 'salle' ? r.salleId : this.cible() === 'cours' ? r.coursId : r.coachId;
      return idLie === id && r.statut === 'confirmee' && this.reservationService.versDate(r.dateDebut) < new Date();
    });
  });

  // Première réservation qui n'a pas encore d'avis sur cette cible
  reservationLibre = computed(() =>
    this.reservationsLiees().find(
      (r) => !this.avis().some((a) => a.reservation === '/api/reservations/' + r.id && a[this.cible()] === this.lien()),
    ),
  );

  ngOnInit(): void {
    this.chargerAvis();
    if (this.authService.connecte()) {
      this.reservationService.getMesReservations().subscribe((reponse) => this.mesReservations.set(reponse));
    }
  }

  chargerAvis(): void {
    this.avisService.getAvis().subscribe((reponse) => this.avis.set(reponse.member));
  }

  estAMoi(unAvis: AvisInterface): boolean {
    return this.mesLiens().includes(unAvis.reservation);
  }

  // Part des avis publiés pour une note (barres de 5★ à 1★)
  partNote(note: number): number {
    const liste = this.avisPublies();
    return liste.length === 0 ? 0 : (liste.filter((a) => a.note === note).length / liste.length) * 100;
  }

  // "Mariam O." → "MO"
  initiales(nom: string | undefined): string {
    return (nom ?? '?')
      .split(' ')
      .map((mot) => mot.charAt(0))
      .join('')
      .toUpperCase();
  }

  envoyer(): void {
    if (this.avisForm.invalid) {
      this.avisForm.markAllAsTouched();
      return;
    }
    this.erreur.set('');
    this.succes.set('');
    const commentaire = this.avisForm.value.commentaire!.trim();

    // Modification d'un de mes avis
    const idAvis = this.idEnModification();
    if (idAvis) {
      this.avisService.modifierAvis(idAvis, { note: this.note(), commentaire }).subscribe({
        next: () => {
          this.annuler();
          this.chargerAvis();
          this.succes.set('Avis modifié.');
        },
        error: (err) => this.erreur.set(err.error?.detail ?? "Impossible de modifier l'avis."),
      });
      return;
    }

    const reservation = this.reservationLibre();
    if (!reservation) {
      return;
    }

    // Nouvel avis « en attente » : il devient visible pour tous après validation par l'admin
    const avis: AvisInterface = {
      note: this.note(),
      commentaire,
      statut: 'en_attente',
      reservation: '/api/reservations/' + reservation.id,
      [this.cible()]: this.lien(),
    };

    this.avisService.creerAvis(avis).subscribe({
      next: () => {
        this.annuler();
        this.chargerAvis();
        this.succes.set('Merci ! Votre avis sera visible après validation.');
      },
      // 403 : email non confirmé / 422 : données invalides
      error: (err) => this.erreur.set(err.error?.detail ?? "Impossible d'envoyer l'avis."),
    });
  }

  // Remplit le formulaire avec l'avis à modifier
  modifier(unAvis: AvisInterface): void {
    this.idEnModification.set(unAvis.id!);
    this.note.set(unAvis.note);
    this.avisForm.setValue({ commentaire: unAvis.commentaire });
    this.succes.set('');
  }

  // Remet le formulaire à zéro (après envoi ou en quittant la modification)
  annuler(): void {
    this.idEnModification.set(null);
    this.avisForm.reset();
    this.note.set(5);
  }

  supprimer(unAvis: AvisInterface): void {
    this.avisService.supprimerAvis(unAvis.id!).subscribe({
      next: () => {
        this.avis.update((liste) => liste.filter((a) => a.id !== unAvis.id));
        this.idASupprimer.set(null);
        this.succes.set('Avis supprimé.');
      },
      error: (err) => this.erreur.set(err.error?.detail ?? "Impossible de supprimer l'avis."),
    });
  }

  libelleStatut(statut: string): string {
    return statut === 'refuse' ? 'Refusé' : 'En attente de validation';
  }
}
