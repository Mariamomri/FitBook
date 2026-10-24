<?php

namespace App\Entity;

use App\Repository\CarteMembreRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;

#[ORM\Entity(repositoryClass: CarteMembreRepository::class)]
#[ORM\Table(name: 'cartes_membre')]
#[ApiResource] //pour exposer l'entité via l'API Platform
class CarteMembre
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20, unique: true)] //numero di affiliazione unico per ogni carta
    private ?string $numeroAffiliation = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $dateEmission = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $dateExpiration = null;

    #[ORM\Column(length: 20)]
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
