<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Reservation;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

final class ReservationProcessor implements ProcessorInterface
{
  public function __construct(
    #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
    private ProcessorInterface $persistProcessor,
    private Security $security,
    private MailerInterface $mailer
  ) {}

  public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Reservation
  {
    // Le propriétaire de la réservation est toujours l'utilisateur connecté
    $data->setUser($this->security->getUser());

    $seance = $data->getSeance();
    $capacite = $seance->getCours()->getCapacite();

    // On compte seulement les réservations confirmées de cette séance
    $confirmees = 0;
    foreach ($seance->getReservations() as $reservation) {
      if ($reservation->getStatut() === 'confirmee') {
        $confirmees++;
      }
      // La même personne ne peut pas réserver deux fois la même séance
      if ($reservation->getUser() === $data->getUser() && $reservation->getStatut() === 'confirmee') {
        throw new UnprocessableEntityHttpException('Vous avez déjà réservé cette séance.');
      }
    }

    // Séance complète : on refuse la réservation
    if ($confirmees >= $capacite) {
      throw new UnprocessableEntityHttpException('Cette séance est complète.');
    }

    $reservation = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

    // Email de confirmation de la réservation
    $email = (new TemplatedEmail())
      ->from(new Address('noreply@fitbook.be', 'FitBook'))
      ->to((string) $reservation->getUser()->getEmail())
      ->subject('Confirmation de votre réservation - FitBook')
      ->htmlTemplate('reservation_confirmation.html.twig')
      ->context(['reservation' => $reservation]);

    try {
      $this->mailer->send($email);
    } catch (TransportExceptionInterface $exception) {
      // La réservation est enregistrée même si l'email ne part pas (serveur mail indisponible)
    }

    return $reservation;
  }
}
