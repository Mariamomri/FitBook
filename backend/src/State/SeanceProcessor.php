<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Seance;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

/**
 * Processor API Platform pour la modification d'une séance (PATCH) :
 * si la séance passe à « annulee », les réservations confirmées sont annulées
 * et chaque sportif reçoit un email.
 *
 * @implements ProcessorInterface<Seance, Seance>
 */
final class SeanceProcessor implements ProcessorInterface
{
  public function __construct(
    #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
    private ProcessorInterface $persistProcessor,
    private MailerInterface $mailer,
    #[Autowire('%env(FRONTEND_URL)%')] private string $frontendUrl, // adresse du site Angular
  ) {}

  public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Seance
  {
    // Statut avant la modification (API Platform garde une copie de l'objet d'origine)
    $ancienStatut = $context['previous_data']?->getStatut();
    $vientDEtreAnnulee = $data->getStatut() === 'annulee' && $ancienStatut !== 'annulee';

    // Les réservations confirmées de la séance passent à « annulee » (la place n'existe plus)
    $sportifsAPrevenir = [];
    if ($vientDEtreAnnulee) {
      foreach ($data->getReservations() as $reservation) {
        if ($reservation->getStatut() === 'confirmee') {
          $reservation->setStatut('annulee');
          $sportifsAPrevenir[] = $reservation;
        }
      }
    }

    // Enregistrement en base (la séance et ses réservations)
    $seance = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

    // Un email par sportif concerné (template seance_annulee.html.twig)
    foreach ($sportifsAPrevenir as $reservation) {
      $this->mailer->send(
        (new TemplatedEmail())
          ->from(new Address('noreply@fitbook.be', 'FitBook'))
          ->to((string) $reservation->getUser()->getEmail())
          ->subject('Votre séance a été annulée - FitBook')
          ->htmlTemplate('seance_annulee.html.twig')
          ->context(['reservation' => $reservation, 'lienActivites' => $this->frontendUrl . '/activites'])
      );
    }

    return $seance;
  }
}
