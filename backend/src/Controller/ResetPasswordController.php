<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

// Mot de passe oublié : 1) demande du lien par email  2) choix du nouveau mot de passe
final class ResetPasswordController extends AbstractController
{
    public function __construct(
        private ResetPasswordHelperInterface $resetPasswordHelper,
        #[Autowire('%env(FRONTEND_URL)%')] private string $frontendUrl, // adresse du site Angular
    ) {}

    // 1) Le sportif donne son email : s'il existe, il reçoit un lien valable 1 heure
    #[Route('/api/mot-de-passe-oublie', name: 'api_mot_de_passe_oublie', methods: ['POST'])]
    public function demander(Request $request, UserRepository $userRepository, MailerInterface $mailer): JsonResponse
    {
        $donnees = json_decode($request->getContent(), true);
        $email = trim($donnees['email'] ?? '');

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['message' => "Format d'email invalide."], 422);
        }

        // Même réponse que le compte existe ou non : on ne révèle pas quels emails sont inscrits
        $reponse = ['message' => 'Si un compte existe pour cet email, un lien valable 1 h a été envoyé.'];

        $user = $userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            return $this->json($reponse);
        }

        try {
            $resetToken = $this->resetPasswordHelper->generateResetToken($user);
        } catch (ResetPasswordExceptionInterface $e) {
            // Demande déjà faite il y a peu (anti-spam) : on répond pareil
            return $this->json($reponse);
        }

        $mailer->send(
            (new TemplatedEmail())
                ->from(new Address('noreply@fitbook.be', 'FitBook'))
                ->to((string) $user->getEmail())
                ->subject('Nouveau mot de passe - FitBook')
                ->htmlTemplate('reset_password_email.html.twig')
                ->context([
                    'user' => $user,
                    'lien' => $this->frontendUrl . '/nouveau-mot-de-passe?token=' . $resetToken->getToken(),
                ])
        );

        return $this->json($reponse);
    }

    // 2) Le lien du mail ouvre la page Angular qui envoie le token et le nouveau mot de passe
    #[Route('/api/nouveau-mot-de-passe', name: 'api_nouveau_mot_de_passe', methods: ['POST'])]
    public function changer(Request $request, UserPasswordHasherInterface $passwordHasher, EntityManagerInterface $entityManager): JsonResponse
    {
        $donnees = json_decode($request->getContent(), true);
        $token = $donnees['token'] ?? '';
        $motDePasse = $donnees['password'] ?? '';

        // 8 caractères minimum, au moins une majuscule et un chiffre
        if (!preg_match('/^(?=.*[A-Z])(?=.*\d).{8,}$/', $motDePasse)) {
            return $this->json(['message' => 'Le mot de passe doit contenir 8 caractères minimum, 1 majuscule et 1 chiffre.'], 422);
        }

        try {
            $user = $this->resetPasswordHelper->validateTokenAndFetchUser($token);
        } catch (ResetPasswordExceptionInterface $e) {
            return $this->json(['message' => 'Ce lien est invalide ou a expiré. Faites une nouvelle demande.'], 400);
        }

        // Le lien ne sert qu'une fois
        $this->resetPasswordHelper->removeResetRequest($token);

        $user->setPassword($passwordHasher->hashPassword($user, $motDePasse));
        $entityManager->flush();

        return $this->json(['message' => 'Mot de passe modifié. Vous pouvez vous connecter.']);
    }
}
