<?php

namespace App\Controller;

use App\Entity\User;
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
}
