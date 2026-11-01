<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Reservation;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

final class ReservationProcessor implements ProcessorInterface
{
  public function __construct(
    #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
    private ProcessorInterface $persistProcessor,
    private MailerInterface $mailer,
    private Security $security,
  ) {}

  public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Reservation
  {
    // La réservation appartient toujours à l'utilisateur connecté (on ne fait pas confiance au JSON envoyé)
    $data->setUser($this->security->getUser());

    $seance = $data->getSeance();
    $capacite = $seance->getCours()->getCapacite();

    // On ne réserve qu'une séance ouverte qui n'a pas encore commencé
    if ($seance->getStatut() !== 'ouverte') {
      throw new UnprocessableEntityHttpException('Cette séance n\'est pas ouverte aux réservations.');
    }
    if ($seance->getDateDebut() <= new \DateTimeImmutable()) {
      throw new UnprocessableEntityHttpException('Cette séance a déjà commencé.');
    }

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

    // Enregistrement en base (persist + flush)
    $reservation = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

    // QR code de la réservation : même texte que dans l'application Angular ("FITBOOK-RESERVATION:" + numéro)
    $qrCode = new QrCode(data: 'FITBOOK-RESERVATION:' . $reservation->getNumero(), size: 220, margin: 10);
    $imageQr = (new PngWriter())->write($qrCode)->getString();

    // Email de confirmation au sportif (template reservation_confirmation.html.twig)
    // embed : l'image est jointe à l'email, le template l'affiche avec src="cid:qrcode"
    $this->mailer->send(
      (new TemplatedEmail())
        ->from(new Address('noreply@fitbook.be', 'FitBook'))
        ->to((string) $reservation->getUser()->getEmail())
        ->subject('Réservation confirmée - FitBook')
        ->htmlTemplate('reservation_confirmation.html.twig')
        ->context(['reservation' => $reservation])
        ->embed($imageQr, 'qrcode', 'image/png')
    );

    return $reservation;
  }
}
