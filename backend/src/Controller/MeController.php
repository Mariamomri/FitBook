<?php

namespace App\Controller;

use App\Entity\Reservation;
use App\Entity\User;
use App\Repository\ReservationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class MeController extends AbstractController
{

    // Données de l'utilisateur connecté (profil, couleur du site, rôle)
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    public function moi(): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY'); // Vérifie que l'utilisateur est authentifié avec un JWT valide

        /** @var User $user */
        $user = $this->getUser();

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstname' => $user->getFirstname(),
            'lastname' => $user->getLastname(),
            'phone' => $user->getPhone(),
            'accentColor' => $user->getAccentColor(),
            'roles' => $user->getRoles(),
            'imageName' => $user->getImageName(),
        ]);
    }

    // Réservations de l'utilisateur connecté uniquement (JWT obligatoire)
    #[Route('/api/me/reservations', name: 'api_me_reservations', methods: ['GET'])]
    public function mesReservations(): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        /** @var User $user */
        $user = $this->getUser();

        $resultat = [];
        foreach ($user->getReservations() as $reservation) {
            $seance = $reservation->getSeance();
            $cours = $seance->getCours();

            $resultat[] = [
                'id' => $reservation->getId(),
                'numero' => $reservation->getNumero(),
                'statut' => $reservation->getStatut(),
                'cours' => $cours->getTitre(),
                'salle' => $cours->getSalle()->getNom(),
                'dateDebut' => $seance->getDateDebut()->format('d/m/Y H:i'),
                'dateFin' => $seance->getDateFin()->format('H:i'),
            ];
        }

        return $this->json($resultat);
    }

    // Réservations des salles du gestionnaire connecté
    #[Route('/api/me/salle/reservations', name: 'api_me_salle_reservations', methods: ['GET'])]
    public function reservationsDeMesSalles(ReservationRepository $reservationRepository): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_SALLE');

        /** @var User $user */
        $user = $this->getUser();

        return $this->json($this->versTableau($reservationRepository->findPourGestionnaire($user)));
    }

    // Réservations des cours du coach connecté
    #[Route('/api/me/coach/reservations', name: 'api_me_coach_reservations', methods: ['GET'])]
    public function reservationsDeMesCours(ReservationRepository $reservationRepository): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_COACH');

        /** @var User $user */
        $user = $this->getUser();

        return $this->json($this->versTableau($reservationRepository->findPourCoach($user)));
    }

    // Transforme les réservations en tableau simple pour le JSON (nom du sportif, cours, salle, date)
    private function versTableau(array $reservations): array
    {
        $resultat = [];
        foreach ($reservations as $reservation) {
            $seance = $reservation->getSeance();
            $cours = $seance->getCours();
            $sportif = $reservation->getUser();

            $resultat[] = [
                'id' => $reservation->getId(),
                'numero' => $reservation->getNumero(),
                'statut' => $reservation->getStatut(),
                'sportif' => $sportif->getFirstname() . ' ' . $sportif->getLastname(),
                'email' => $sportif->getEmail(),
                'cours' => $cours->getTitre(),
                'salle' => $cours->getSalle()->getNom(),
                'dateDebut' => $seance->getDateDebut()->format('Y-m-d\TH:i:sP'),
            ];
        }

        return $resultat;
    }

    // Annulation d'une réservation par son propriétaire : le statut passe à annulee et la place se libère
    #[Route('/api/me/reservations/{id}/annuler', name: 'api_me_reservation_annuler', methods: ['PATCH'])]
    public function annuler(Reservation $reservation, EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        if ($reservation->getUser() !== $this->getUser()) {
            return $this->json(['message' => 'Vous ne pouvez annuler que vos propres réservations.'], 403);
        }

        if ($reservation->getStatut() === 'annulee') {
            return $this->json(['message' => 'Cette réservation est déjà annulée.'], 422);
        }

        if ($reservation->getSeance()->getDateDebut() < new \DateTime()) {
            return $this->json(['message' => 'Impossible d\'annuler une séance déjà commencée.'], 422);
        }

        $reservation->setStatut('annulee');
        $entityManager->flush();

        return $this->json(['message' => 'Réservation annulée.', 'statut' => 'annulee']);
    }
}
