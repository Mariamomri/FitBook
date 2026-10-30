<?php

namespace App\Controller;

use App\Entity\Reservation;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class MeController extends AbstractController
{
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
