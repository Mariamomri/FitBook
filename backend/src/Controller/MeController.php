<?php

namespace App\Controller;

use App\Entity\CarteMembre;
use App\Entity\Reservation;
use App\Entity\User;
use App\Repository\ReservationRepository;
use App\Security\EmailVerifier;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mime\Address;
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
                // Identifiants utiles pour savoir sur quoi le sportif peut laisser un avis
                'coursId' => $cours->getId(),
                'salleId' => $cours->getSalle()->getId(),
                'coachId' => $cours->getCoach()?->getId(),
            ];
        }

        return $this->json($resultat);
    }

    // Renvoie le mail de confirmation (le lien reçu à l'inscription expire après 1 heure)
    #[Route('/api/me/renvoyer-confirmation', name: 'api_me_renvoyer_confirmation', methods: ['POST'])]
    public function renvoyerConfirmation(EmailVerifier $emailVerifier): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        /** @var User $user */
        $user = $this->getUser();

        if ($user->isVerified()) {
            return $this->json(['message' => 'Votre email est déjà confirmé.'], 422);
        }

        $emailVerifier->sendEmailConfirmation(
            'app_verify_email',
            $user,
            (new TemplatedEmail())
                ->from(new Address('noreply@fitbook.be', 'FitBook'))
                ->to((string) $user->getEmail())
                ->subject('Confirmez votre email - FitBook')
                ->htmlTemplate('confirmation_email.html.twig')
        );

        return $this->json(['message' => 'Email de confirmation envoyé à ' . $user->getEmail() . '.']);
    }

    // Carte de membre de l'utilisateur connecté (null s'il n'en a pas encore)
    #[Route('/api/me/carte', name: 'api_me_carte', methods: ['GET'])]
    public function maCarte(): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        /** @var User $user */
        $user = $this->getUser();

        return $this->json($this->carteEnTableau($user->getCarteMembre()));
    }

    // Demander sa carte (première fois) ou la renouveler quand elle a expiré : valable 1 an
    #[Route('/api/me/carte', name: 'api_me_carte_demander', methods: ['POST'])]
    public function demanderCarte(EntityManagerInterface $entityManager): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

        /** @var User $user */
        $user = $this->getUser();
        $carte = $user->getCarteMembre();
        $maintenant = new \DateTimeImmutable();

        if ($carte && $carte->getStatut() === 'suspendue') {
            return $this->json(['message' => "Votre carte est suspendue. Contactez l'administrateur."], 403);
        }
        if ($carte && $carte->getDateExpiration() > $maintenant) {
            return $this->json(['message' => 'Votre carte est encore valable.'], 422);
        }

        // Première carte : numéro unique basé sur l'id de l'utilisateur (ex. FB-2026-002007)
        if (!$carte) {
            $carte = new CarteMembre();
            $carte->setNumeroAffiliation('FB-' . $maintenant->format('Y') . '-' . str_pad((string) $user->getId(), 6, '0', STR_PAD_LEFT));
            $user->setCarteMembre($carte);
            $entityManager->persist($carte);
        }

        $carte->setDateEmission($maintenant);
        $carte->setDateExpiration($maintenant->modify('+1 year'));
        $carte->setStatut('active');
        $entityManager->flush();

        return $this->json($this->carteEnTableau($carte), 201);
    }

    // Carte en tableau simple pour le JSON ; une carte dont la date est passée est « expiree »
    private function carteEnTableau(?CarteMembre $carte): ?array
    {
        if (!$carte) {
            return null;
        }

        $statut = $carte->getStatut();
        if ($statut === 'active' && $carte->getDateExpiration() < new \DateTimeImmutable()) {
            $statut = 'expiree';
        }

        return [
            'id' => $carte->getId(),
            'numero' => $carte->getNumeroAffiliation(),
            'dateEmission' => $carte->getDateEmission()->format('Y-m-d'),
            'dateExpiration' => $carte->getDateExpiration()->format('Y-m-d'),
            'statut' => $statut,
        ];
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
