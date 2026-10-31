<?php

namespace App\Entity;

use App\Repository\AvisRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Traits\Timestampable;
use ApiPlatform\Metadata\ApiResource; //pour exposer l'entité via l'API Platform
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;

// Un avis vient toujours d'une réservation (donner_lieu 1,1) et porte sur UNE cible :
// une salle OU un coach OU un cours (noter_salle / noter_coach / noter_cours 0,1).
#[ORM\Entity(repositoryClass: AvisRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ORM\Table(name: 'avis_notes')]
//pour exposer l'entité via l'API Platform
// Lecture publique (notes affichées sur les fiches) ; on ne note que ses propres réservations ;
// modification par l'auteur ou l'admin, suppression (modération) par l'auteur ou l'admin
#[ApiResource(operations: [
    new GetCollection(),
    new Get(),
    new Post(
        security: "is_granted('ROLE_USER') and user.isVerified()",
        securityMessage: 'Veuillez confirmer votre email avant de laisser un avis.',
        securityPostDenormalize: "object.getReservation()?.getUser() == user",
        securityPostDenormalizeMessage: 'Vous ne pouvez donner un avis que sur vos propres réservations.'
    ),
    new Patch(security: "is_granted('ROLE_ADMIN') or object.getReservation()?.getUser() == user"),
    new Delete(security: "is_granted('ROLE_ADMIN') or object.getReservation()?.getUser() == user")
])]
class Avis
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $note = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $commentaire = null;

    #[ORM\Column(length: 20)]
    private ?string $statut = null;

    #[ORM\ManyToOne(inversedBy: 'avis')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Reservation $reservation = null;

    #[ORM\ManyToOne(inversedBy: 'avis')]
    private ?Salle $salle = null;

    #[ORM\ManyToOne(inversedBy: 'avis')]
    private ?Coach $coach = null;

    #[ORM\ManyToOne(inversedBy: 'avis')]
    private ?Cours $cours = null;

    use Timestampable;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNote(): ?int
    {
        return $this->note;
    }

    public function setNote(int $note): static
    {
        $this->note = $note;

        return $this;
    }

    public function getCommentaire(): ?string
    {
        return $this->commentaire;
    }

    public function setCommentaire(string $commentaire): static
    {
        $this->commentaire = $commentaire;

        return $this;
    }

    public function getStatut(): ?string
    {
        return $this->statut;
    }

    public function setStatut(string $statut): static
    {
        $this->statut = $statut;

        return $this;
    }

    public function getReservation(): ?Reservation
    {
        return $this->reservation;
    }

    public function setReservation(?Reservation $reservation): static
    {
        $this->reservation = $reservation;

        return $this;
    }

    public function getSalle(): ?Salle
    {
        return $this->salle;
    }

    public function setSalle(?Salle $salle): static
    {
        $this->salle = $salle;

        return $this;
    }

    public function getCoach(): ?Coach
    {
        return $this->coach;
    }

    public function setCoach(?Coach $coach): static
    {
        $this->coach = $coach;

        return $this;
    }

    public function getCours(): ?Cours
    {
        return $this->cours;
    }

    public function setCours(?Cours $cours): static
    {
        $this->cours = $cours;

        return $this;
    }

    // Auteur de l'avis affiché sur les fiches : prénom + initiale du nom (ex. "Mariam O.")
    public function getAuteur(): ?string
    {
        $user = $this->reservation?->getUser();
        if (!$user) {
            return null;
        }

        return $user->getFirstname() . ' ' . mb_substr($user->getLastname() ?? '', 0, 1) . '.';
    }

    // Photo de profil de l'auteur (null = pas de photo)
    public function getAuteurImage(): ?string
    {
        return $this->reservation?->getUser()?->getImageName();
    }
}
