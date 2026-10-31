<?php

namespace App\Repository;

use App\Entity\Reservation;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Reservation>
 */
class ReservationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Reservation::class);
    }

    /* Réservations des salles gérées par ce gestionnaire */
    public function findPourGestionnaire(User $gestionnaire): array
    {
        return $this->createQueryBuilder('r')
            ->join('r.seance', 's')
            ->join('s.cours', 'c')
            ->join('c.salle', 'sa')
            ->andWhere('sa.gestionnaire = :gestionnaire')
            ->setParameter('gestionnaire', $gestionnaire)
            ->orderBy('s.dateDebut', 'DESC')
            ->getQuery()
            ->getResult()
        ;
    }

    /* Réservations des cours donnés par ce coach (on part du compte User du coach) */
    public function findPourCoach(User $user): array
    {
        return $this->createQueryBuilder('r')
            ->join('r.seance', 's')
            ->join('s.cours', 'c')
            ->join('c.coach', 'co')
            ->andWhere('co.user = :user')
            ->setParameter('user', $user)
            ->orderBy('s.dateDebut', 'DESC')
            ->getQuery()
            ->getResult()
        ;
    }

//    /**
//     * @return Reservation[] Returns an array of Reservation objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('r.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Reservation
//    {
//        return $this->createQueryBuilder('r')
//            ->andWhere('r.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
