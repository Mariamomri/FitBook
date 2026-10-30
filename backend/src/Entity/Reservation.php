<?php

namespace App\Entity;

use App\Repository\ReservationRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Traits\Timestampable;

//pour exposer l'entité via l'API Platform
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\ApiProperty;

use Symfony\Component\Validator\Constraints as Assert;

use App\State\ReservationProcessor;

#[ORM\Entity(repositoryClass: ReservationRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ORM\Table(name: 'reservations')]
// Liste complète : admin ; une réservation : admin ou son propriétaire ; modification et suppression : admin
// (le sportif annule sa réservation avec la route /api/me/reservations/{id}/annuler)
#[ApiResource(operations: [
    new GetCollection(security: "is_granted('ROLE_ADMIN')"),
    new Get(security: "is_granted('ROLE_ADMIN') or object.getUser() == user"),
    new Post(
        processor: ReservationProcessor::class,
        security: "is_granted('ROLE_USER') and user.isVerified()",
        securityMessage: 'Veuillez confirmer votre email avant de réserver.'
    ),
    new Patch(security: "is_granted('ROLE_ADMIN')"),
    new Delete(security: "is_granted('ROLE_ADMIN')")
])]
class Reservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20, unique: true)] // numéro de réservation affiché à l'utilisateur (ex. FB-2026-00123)
    #[ApiProperty(writable: false)] // généré automatiquement dans le constructeur
    #[Assert\NotBlank(message: 'Le numéro est obligatoire')]
    private ?string $numero = null;

    #[ORM\Column(length: 20)]
    #[ApiProperty(writable: false)] // confirmee à la création, annulee après une annulation
    #[Assert\NotBlank(message: 'Le statut est obligatoire')]
    private ?string $statut = 'confirmee';

    #[ORM\ManyToOne(inversedBy: 'reservations')]
    #[ORM\JoinColumn(nullable: false)]
    #[ApiProperty(writable: false)] // l'utilisateur connecté est ajouté par le ReservationProcessor
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'reservations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotNull(message: 'La séance est obligatoire')]
    private ?Seance $seance = null;

    use Timestampable;

    /**
     * @var Collection<int, Avis>
     */
    #[ORM\OneToMany(targetEntity: Avis::class, mappedBy: 'reservation', orphanRemoval: true)]
    private Collection $avis;

    public function __construct()
    {
        $this->avis = new ArrayCollection();
        // Numéro unique lisible, ex. FB-2026-A1B2C3
        $this->numero = 'FB-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(3)));
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNumero(): ?string
    {
        return $this->numero;
    }

    public function setNumero(string $numero): static
    {
        $this->numero = $numero;

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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getSeance(): ?Seance
    {
        return $this->seance;
    }

    public function setSeance(?Seance $seance): static
    {
        $this->seance = $seance;

        return $this;
    }

    /**
     * @return Collection<int, Avis>
     */
    public function getAvis(): Collection
    {
        return $this->avis;
    }

    public function addAvi(Avis $avi): static
    {
        if (!$this->avis->contains($avi)) {
            $this->avis->add($avi);
            $avi->setReservation($this);
        }

        return $this;
    }

    public function removeAvi(Avis $avi): static
    {
        if ($this->avis->removeElement($avi)) {
            // set the owning side to null (unless already changed)
            if ($avi->getReservation() === $this) {
                $avi->setReservation(null);
            }
        }

        return $this;
    }
}
