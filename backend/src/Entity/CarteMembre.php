<?php

namespace App\Entity;

use App\Repository\CarteMembreRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use Symfony\Component\Validator\Constraints as Assert; // règles de validation des données envoyées

#[ORM\Entity(repositoryClass: CarteMembreRepository::class)]
#[ORM\Table(name: 'cartes_membre')]
// Gestion des cartes par l'admin ; le sportif voit et demande sa carte avec /api/me/carte
#[ApiResource(operations: [
    new GetCollection(security: "is_granted('ROLE_ADMIN')"),
    new Get(security: "is_granted('ROLE_ADMIN') or object.getUser() == user"),
    new Post(security: "is_granted('ROLE_ADMIN')"),
    new Patch(security: "is_granted('ROLE_ADMIN')"),
    new Delete(security: "is_granted('ROLE_ADMIN')")
])]
class CarteMembre
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20, unique: true)] //numéro d'affiliation unique pour chaque carte
    #[Assert\NotBlank(message: "Le numéro d'affiliation est obligatoire.")]
    #[Assert\Length(max: 20)]
    private ?string $numeroAffiliation = null;

    #[ORM\Column]
    #[Assert\NotNull(message: "La date d'émission est obligatoire.")]
    private ?\DateTimeImmutable $dateEmission = null;

    #[ORM\Column]
    #[Assert\NotNull(message: "La date d'expiration est obligatoire.")]
    #[Assert\GreaterThan(propertyPath: 'dateEmission', message: "L'expiration doit être après l'émission.")]
    private ?\DateTimeImmutable $dateExpiration = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['active', 'expiree', 'suspendue'], message: 'Statut invalide.')]
    private ?string $statut = null;

    #[ORM\OneToOne(inversedBy: 'carteMembre', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNumeroAffiliation(): ?string
    {
        return $this->numeroAffiliation;
    }

    public function setNumeroAffiliation(string $numeroAffiliation): static
    {
        $this->numeroAffiliation = $numeroAffiliation;

        return $this;
    }

    public function getDateEmission(): ?\DateTimeImmutable
    {
        return $this->dateEmission;
    }

    public function setDateEmission(\DateTimeImmutable $dateEmission): static
    {
        $this->dateEmission = $dateEmission;

        return $this;
    }

    public function getDateExpiration(): ?\DateTimeImmutable
    {
        return $this->dateExpiration;
    }

    public function setDateExpiration(\DateTimeImmutable $dateExpiration): static
    {
        $this->dateExpiration = $dateExpiration;

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

    public function setUser(User $user): static
    {
        $this->user = $user;

        return $this;
    }
}
