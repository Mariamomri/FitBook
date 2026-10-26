<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Reservation;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

final class ReservationProcessor implements ProcessorInterface
{
  public function __construct(
    #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
    private ProcessorInterface $persistProcessor
  ) {}

  public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Reservation
  {
    $seance = $data->getSeance();
    $capacite = $seance->getCours()->getCapacite();

    // On compte seulement les réservations confirmées de cette séance
    $confirmees = 0;
    foreach ($seance->getReservations() as $reservation) {
      if ($reservation->getStatut() === 'confirmee') {
        $confirmees++;
      }
    }

    // Séance complète : on refuse la réservation
    if ($confirmees >= $capacite) {
      throw new UnprocessableEntityHttpException('Cette séance est complète.');
    }

    return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
  }
}
