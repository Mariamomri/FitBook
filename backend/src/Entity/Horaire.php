<?php

namespace App\Entity;

use App\Repository\HoraireRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource; //pour exposer l'entité via l'API Platform
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use Symfony\Component\Validator\Constraints as Assert; // règles de validation des données envoyées

#[ORM\Entity(repositoryClass: HoraireRepository::class)]
#[ORM\Table(name: 'horaires')]
//pour exposer l'entité via l'API Platform
// Lecture publique ; seuls l'admin et le gestionnaire de la salle gèrent ses horaires
#[ApiResource(operations: [
    new GetCollection(),
    new Get(),
    new Post(securityPostDenormalize: "is_granted('ROLE_ADMIN') or object.getSalle()?.getGestionnaire() == user"),
    new Patch(security: "is_granted('ROLE_ADMIN') or object.getSalle()?.getGestionnaire() == user", securityPostDenormalize: "is_granted('ROLE_ADMIN') or object.getSalle()?.getGestionnaire() == user"),
    new Delete(security: "is_granted('ROLE_ADMIN') or object.getSalle()?.getGestionnaire() == user")
])]
class Horaire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20)]
    #[Assert\Choice(choices: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'], message: 'Jour invalide.')]
    private ?string $jour = null;

    #[ORM\Column(type: Types::TIME_IMMUTABLE)]
    #[Assert\NotNull(message: "L'heure d'ouverture est obligatoire.")]
    private ?\DateTimeImmutable $heureOuverture = null;

    #[ORM\Column(type: Types::TIME_IMMUTABLE)]
    #[Assert\NotNull(message: "L'heure de fermeture est obligatoire.")]
    #[Assert\GreaterThan(propertyPath: 'heureOuverture', message: "La fermeture doit être après l'ouverture.")]
    private ?\DateTimeImmutable $heureFermeture = null;

    #[ORM\ManyToOne(inversedBy: 'horaires')]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotNull(message: 'La salle est obligatoire.')]
    private ?Salle $salle = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getJour(): ?string
    {
        return $this->jour;
    }

    public function setJour(string $jour): static
    {
        $this->jour = $jour;

        return $this;
    }

    public function getHeureOuverture(): ?\DateTimeImmutable
    {
        return $this->heureOuverture;
    }

    public function setHeureOuverture(\DateTimeImmutable $heureOuverture): static
    {
        $this->heureOuverture = $heureOuverture;

        return $this;
    }

    public function getHeureFermeture(): ?\DateTimeImmutable
    {
        return $this->heureFermeture;
    }

    public function setHeureFermeture(\DateTimeImmutable $heureFermeture): static
    {
        $this->heureFermeture = $heureFermeture;

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
}
