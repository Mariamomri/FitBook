<?php

namespace App\Controller;

use App\Repository\UserRepository;
use App\Security\EmailVerifier;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

class VerifyEmailController extends AbstractController
{
  public function __construct(
    private EmailVerifier $emailVerifier,
    #[Autowire('%env(FRONTEND_URL)%')] private string $frontendUrl, // adresse du site Angular
  ) {}

  // lien cliqué dans le mail de confirmation (même nom de route que chez le prof)
  #[Route('/verify/email', name: 'app_verify_email')]
  public function verifyUserEmail(Request $request, UserRepository $userRepository): Response
  {
    // l'utilisateur n'est pas connecté : on le retrouve grâce à l'id du lien signé
    $id = $request->query->get('id');
    $user = $id ? $userRepository->find($id) : null;

    if (null === $user) {
      return $this->redirect($this->frontendUrl . '/login?verified=error');
    }

    // vérifie la signature et la date d'expiration, puis met isVerified à true
    try {
      $this->emailVerifier->handleEmailConfirmation($request, $user);
    } catch (VerifyEmailExceptionInterface $exception) {
      return $this->redirect($this->frontendUrl . '/login?verified=error');
    }

    // retour sur Angular, page de connexion
    return $this->redirect($this->frontendUrl . '/login?verified=1');
  }
}
