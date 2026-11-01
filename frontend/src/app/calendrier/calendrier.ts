import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../reservations/reservation-service';
import { ReservationInterface } from '../reservations/reservation-interface';
import { SidebarSportif } from '../layout/sidebar-sportif/sidebar-sportif';

// Une case du calendrier : un numéro de jour (ou vide) + les séances de ce jour
interface CaseJour {
  jour: number | null;
  seances: ReservationInterface[];
}

@Component({
  selector: 'app-calendrier',
  imports: [DatePipe, RouterLink, NgTemplateOutlet, SidebarSportif],
  templateUrl: './calendrier.html',
  styleUrl: './calendrier.css',
})
export class Calendrier implements OnInit {
  private reservationService = inject(ReservationService);
  reservations = signal<ReservationInterface[]>([]);

  // false quand le calendrier est affiché dans le dashboard (pas de bandeau ni de menu)
  bandeau = input(true);

  joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  aujourdhui = new Date();

  // Premier jour du mois affiché (au départ : le mois actuel)
  moisAffiche = signal(new Date(this.aujourdhui.getFullYear(), this.aujourdhui.getMonth(), 1));

  // Toutes les cases du mois : cases vides avant le 1er, puis un jour par case
  cases = computed<CaseJour[]>(() => {
    const annee = this.moisAffiche().getFullYear();
    const mois = this.moisAffiche().getMonth();

    // getDay() : 0 = dimanche → on décale pour que la semaine commence le lundi
    const decalage = (new Date(annee, mois, 1).getDay() + 6) % 7;
    const nombreJours = new Date(annee, mois + 1, 0).getDate();

    const liste: CaseJour[] = [];
    for (let i = 0; i < decalage; i++) {
      liste.push({ jour: null, seances: [] });
    }
    for (let jour = 1; jour <= nombreJours; jour++) {
      liste.push({
        jour,
        seances: this.reservations().filter(
          (r) => r.statut !== 'annulee' && this.memeJour(r.dateDebut, jour, mois, annee),
        ),
      });
    }
    return liste;
  });

  ngOnInit(): void {
    this.reservationService.getMesReservations().subscribe((reponse) => this.reservations.set(reponse));
  }

  // La date arrive au format "30/10/2026 18:00" : on compare jour, mois et année
  memeJour(texte: string, jour: number, mois: number, annee: number): boolean {
    const [j, m, a] = texte.split(' ')[0].split('/').map(Number);
    return j === jour && m === mois + 1 && a === annee;
  }

  // "30/10/2026 18:00" → "18:00"
  heure(texte: string): string {
    return texte.split(' ')[1];
  }

  estAujourdhui(jour: number | null): boolean {
    return (
      jour === this.aujourdhui.getDate() &&
      this.moisAffiche().getMonth() === this.aujourdhui.getMonth() &&
      this.moisAffiche().getFullYear() === this.aujourdhui.getFullYear()
    );
  }

  moisPrecedent(): void {
    const m = this.moisAffiche();
    this.moisAffiche.set(new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  moisSuivant(): void {
    const m = this.moisAffiche();
    this.moisAffiche.set(new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }
}