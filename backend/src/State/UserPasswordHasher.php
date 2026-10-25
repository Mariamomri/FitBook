<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Security\EmailVerifier;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Processor API Platform pour User (POST et PATCH) :
 * hash le mot de passe, enregistre l'utilisateur, puis envoie le mail de confirmation à l'inscription.
 *
 * @implements ProcessorInterface<User, User>
 */
final class UserPasswordHasher implements ProcessorInterface
{
  public function __construct(
    // le processor "normal" d'API Platform, celui qui fait persist + flush avec Doctrine
    #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
    private ProcessorInterface $persistProcessor,
    private UserPasswordHasherInterface $passwordHasher,
    private EmailVerifier $emailVerifier,
  ) {}

  public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
  {
    // nouvel utilisateur ? (pas encore d'id en base)
    $isNew = $data->getId() === null;

    // 1. hash du mot de passe
    if ($data->getPlainPassword()) {
      $data->setPassword($this->passwordHasher->hashPassword($data, $data->getPlainPassword()));
      $data->setPlainPassword(null); // on ne garde jamais le mot de passe en clair
    }

    // Nouvelle inscription : on ne fait pas confiance aux données envoyées example injection : { "email": "pirata@gmail.com", "plainPassword": "123456", "roles": ["ROLE_ADMIN"], "isVerified": true }
    if ($isNew) {
      $data->setIsVerified(false);
      $data->setRoles(array_values(array_diff($data->getRoles(), ['ROLE_ADMIN'])));
    }

    // 2. enregistrement en base (persist + flush)
    $user = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

    // 3. à l'inscription : envoi du mail avec le lien signé
    if ($isNew) {
      $this->emailVerifier->sendEmailConfirmation(
        'app_verify_email',
        $user,
        (new TemplatedEmail())
          ->from(new Address('noreply@fitbook.be', 'FitBook'))
          ->to((string) $user->getEmail())
          ->subject('Confirmez votre email - FitBook')
          ->htmlTemplate('confirmation_email.html.twig')
      );
    }

    return $user;
  }
}
