<?php

namespace App\Entity;

use App\Repository\CoursRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\Traits\Timestampable;
use ApiPlatform\Metadata\ApiResource; //pour exposer l'entité via l'API Platform
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use Symfony\Component\Validator\Constraints as Assert; // règles de validation des données envoyées

#[ORM\Entity(repositoryClass: CoursRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ORM\Table(name: 'courses')]
//pour exposer l'entité via l'API Platform
// Lecture publique ; l'admin, le gestionnaire de la salle et le coach du cours gèrent le cours
#[ApiResource(operations: [
    new GetCollection(),
    new Get(),
    new Post(securityPostDenormalize: "is_granted('ROLE_ADMIN') or object.getSalle()?.getGestionnaire() == user or object.getCoach()?.getUser() == user"),
    new Patch(security: "is_granted('ROLE_ADMIN') or object.getSalle()?.getGestionnaire() == user or object.getCoach()?.getUser() == user", securityPostDenormalize: "is_granted('ROLE_ADMIN') or object.getSalle()?.getGestionnaire() == user or object.getCoach()?.getUser() == user"),
    new Delete(security: "is_granted('ROLE_ADMIN') or object.getSalle()?.getGestionnaire() == user or object.getCoach()?.getUser() == user")
])]
class Cours
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le titre est obligatoire.')]
    #[Assert\Length(min: 2, max: 100)]
    private ?string $titre = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank(message: 'La description est obligatoire.')]
    private ?string $description = null;

    #[ORM\Column(length: 50)]
    #[Assert\Choice(choices: ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'], message: 'Niveau invalide.')]
    private ?string $niveau = null;

    #[ORM\Column]
    #[Assert\NotNull(message: 'La capacité est obligatoire.')]
    #[Assert\Positive(message: 'La capacité doit être supérieure à 0.')]
    private ?int $capacite = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 6, scale: 2)]
    #[Assert\NotNull(message: 'Le prix est obligatoire.')]
    #[Assert\PositiveOrZero(message: 'Le prix ne peut pas être négatif.')]
    private ?string $prix = null;

    #[ORM\ManyToOne(inversedBy: 'cours')]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotNull(message: 'La salle est obligatoire.')]
    private ?Salle $salle = null;

    #[ORM\ManyToOne(inversedBy: 'cours')]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotNull(message: "L'activité est obligatoire.")]
    private ?Activite $activite = null;

    #[ORM\ManyToOne(inversedBy: 'cours')]
    private ?Coach $coach = null; // nullable : un cours peut exister sans coach (animer 0,1)

    /**
     * @var Collection<int, Seance>
     */
    #[ORM\OneToMany(targetEntity: Seance::class, mappedBy: 'cours', orphanRemoval: true)]
    private Collection $seances;

    /**
     * @var Collection<int, Avis>
     */
    #[ORM\OneToMany(targetEntity: Avis::class, mappedBy: 'cours')]
    private Collection $avis;

    public function __construct()
    {
        $this->seances = new ArrayCollection();
        $this->avis = new ArrayCollection();
    }

    use Timestampable;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitre(): ?string
    {
        return $this->titre;
    }

    public function setTitre(string $titre): static
    {
        $this->titre = $titre;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getNiveau(): ?string
    {
        return $this->niveau;
    }

    public function setNiveau(string $niveau): static
    {
        $this->niveau = $niveau;

        return $this;
    }

    public function getCapacite(): ?int
    {
        return $this->capacite;
    }

    public function setCapacite(int $capacite): static
    {
        $this->capacite = $capacite;

        return $this;
    }

    public function getPrix(): ?string
    {
        return $this->prix;
    }

    public function setPrix(string $prix): static
    {
        $this->prix = $prix;

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

    public function getActivite(): ?Activite
    {
        return $this->activite;
    }

    public function setActivite(?Activite $activite): static
    {
        $this->activite = $activite;

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

    /**
     * @return Collection<int, Seance>
     */
    public function getSeances(): Collection
    {
        return $this->seances;
    }

    public function addSeance(Seance $seance): static
    {
        if (!$this->seances->contains($seance)) {
            $this->seances->add($seance);
            $seance->setCours($this);
        }

        return $this;
    }

    public function removeSeance(Seance $seance): static
    {
        if ($this->seances->removeElement($seance)) {
            // set the owning side to null (unless already changed)
            if ($seance->getCours() === $this) {
                $seance->setCours(null);
            }
        }

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
            $avi->setCours($this);
        }

        return $this;
    }

    public function removeAvi(Avis $avi): static
    {
        if ($this->avis->removeElement($avi)) {
            // set the owning side to null (unless already changed)
            if ($avi->getCours() === $this) {
                $avi->setCours(null);
            }
        }

        return $this;
    }

    // Nom de la salle, exposé dans l'API
    public function getSalleNom(): ?string
    {
        return $this->salle?->getNom();
    }

    // Nom de l'activité, exposé dans l'API
    public function getActiviteNom(): ?string
    {
        return $this->activite?->getNom();
    }

    // Nom du coach (null si le cours n'a pas de coach)
    public function getCoachNom(): ?string
    {
        return $this->coach?->getNomComplet();
    }
}
