<?php

namespace App\Entity;

use App\Repository\CoachRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\ApiProperty;
use Symfony\Component\HttpFoundation\File\File; // fichier envoyé lors de l'upload
use Vich\UploaderBundle\Mapping\Attribute as Vich; // pour l'upload des photos

#[ORM\Entity(repositoryClass: CoachRepository::class)]
#[ORM\Table(name: 'coaches')]
//pour exposer l'entité via l'API Platform
// Lecture publique ; l'admin crée et supprime les profils, le coach modifie le sien

#[Vich\Uploadable]

#[ApiResource(operations: [
    new GetCollection(),
    new Get(),
    new Post(security: "is_granted('ROLE_ADMIN')"),
    new Patch(security: "is_granted('ROLE_ADMIN') or object.getUser() == user"),
    new Delete(security: "is_granted('ROLE_ADMIN')")
])]
class Coach
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $biographie = null;

    #[ORM\Column]
    private ?int $anneesExperience = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 6, scale: 2)]
    private ?string $tarif = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $certifications = null;

    #[ORM\Column(length: 100)]
    private ?string $langues = null;


    // fichier photo reçu (pas enregistré en base, utilisé seulement pendant l'upload)
    #[Vich\UploadableField(mapping: 'coachs', fileNameProperty: 'imageName', size: 'imageSize')]
    #[ApiProperty(readable: false, writable: false)]
    private ?File $imageFile = null;

    // nom du fichier enregistré dans public/images/coachs
    #[ORM\Column(nullable: true)]
    #[ApiProperty(writable: false)]
    private ?string $imageName = null;

    // taille du fichier en octets
    #[ORM\Column(nullable: true)]
    #[ApiProperty(writable: false)]
    private ?int $imageSize = null;

    // date du dernier changement de photo (permet à Doctrine de voir la modification)
    #[ORM\Column(nullable: true)]
    #[ApiProperty(writable: false)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\OneToOne(inversedBy: 'coach', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    /**
     * @var Collection<int, Activite>
     */
    #[ORM\ManyToMany(targetEntity: Activite::class, inversedBy: 'coaches')]
    #[ORM\JoinTable(name: 'enseigner')] // table de liaison = association « enseigner » du MCD
    private Collection $activites;

    /**
     * @var Collection<int, Cours>
     */
    #[ORM\OneToMany(targetEntity: Cours::class, mappedBy: 'coach')]
    private Collection $cours;

    /**
     * @var Collection<int, Disponibilite>
     */
    #[ORM\OneToMany(targetEntity: Disponibilite::class, mappedBy: 'coach', orphanRemoval: true)]
    private Collection $disponibilites;

    /**
     * @var Collection<int, Avis>
     */
    #[ORM\OneToMany(targetEntity: Avis::class, mappedBy: 'coach')]
    private Collection $avis;

    public function __construct()
    {
        $this->activites = new ArrayCollection();
        $this->cours = new ArrayCollection();
        $this->disponibilites = new ArrayCollection();
        $this->avis = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBiographie(): ?string
    {
        return $this->biographie;
    }

    public function setBiographie(string $biographie): static
    {
        $this->biographie = $biographie;

        return $this;
    }

    public function getAnneesExperience(): ?int
    {
        return $this->anneesExperience;
    }

    public function setAnneesExperience(int $anneesExperience): static
    {
        $this->anneesExperience = $anneesExperience;

        return $this;
    }

    public function getTarif(): ?string
    {
        return $this->tarif;
    }

    public function setTarif(string $tarif): static
    {
        $this->tarif = $tarif;

        return $this;
    }

    public function getCertifications(): ?string
    {
        return $this->certifications;
    }

    public function setCertifications(?string $certifications): static
    {
        $this->certifications = $certifications;

        return $this;
    }

    public function getLangues(): ?string
    {
        return $this->langues;
    }

    public function setLangues(string $langues): static
    {
        $this->langues = $langues;

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

    // Nom complet du coach (pris dans User), exposé dans l'API
    public function getNomComplet(): ?string
    {
        if ($this->user === null) {
            return null;
        }

        return $this->user->getFirstname() . ' ' . $this->user->getLastname();
    }

    /**
     * @return Collection<int, Activite>
     */
    public function getActivites(): Collection
    {
        return $this->activites;
    }

    public function addActivite(Activite $activite): static
    {
        if (!$this->activites->contains($activite)) {
            $this->activites->add($activite);
        }

        return $this;
    }

    public function removeActivite(Activite $activite): static
    {
        $this->activites->removeElement($activite);

        return $this;
    }

    /**
     * @return Collection<int, Cours>
     */
    public function getCours(): Collection
    {
        return $this->cours;
    }

    public function addCour(Cours $cour): static
    {
        if (!$this->cours->contains($cour)) {
            $this->cours->add($cour);
            $cour->setCoach($this);
        }

        return $this;
    }

    public function removeCour(Cours $cour): static
    {
        if ($this->cours->removeElement($cour)) {
            // set the owning side to null (unless already changed)
            if ($cour->getCoach() === $this) {
                $cour->setCoach(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Disponibilite>
     */
    public function getDisponibilites(): Collection
    {
        return $this->disponibilites;
    }

    public function addDisponibilite(Disponibilite $disponibilite): static
    {
        if (!$this->disponibilites->contains($disponibilite)) {
            $this->disponibilites->add($disponibilite);
            $disponibilite->setCoach($this);
        }

        return $this;
    }

    public function removeDisponibilite(Disponibilite $disponibilite): static
    {
        if ($this->disponibilites->removeElement($disponibilite)) {
            // set the owning side to null (unless already changed)
            if ($disponibilite->getCoach() === $this) {
                $disponibilite->setCoach(null);
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
            $avi->setCoach($this);
        }

        return $this;
    }

    public function removeAvi(Avis $avi): static
    {
        if ($this->avis->removeElement($avi)) {
            // set the owning side to null (unless already changed)
            if ($avi->getCoach() === $this) {
                $avi->setCoach(null);
            }
        }

        return $this;
    }


    public function getImageFile(): ?File
    {
        return $this->imageFile;
    }

    // quand une nouvelle photo arrive, on change updatedAt pour que Doctrine enregistre la modification
    public function setImageFile(?File $imageFile = null): void
    {
        $this->imageFile = $imageFile;

        if ($imageFile !== null) {
            $this->updatedAt = new \DateTimeImmutable();
        }
    }

    public function getImageName(): ?string
    {
        return $this->imageName;
    }

    public function setImageName(?string $imageName): void
    {
        $this->imageName = $imageName;
    }

    public function getImageSize(): ?int
    {
        return $this->imageSize;
    }

    public function setImageSize(?int $imageSize): void
    {
        $this->imageSize = $imageSize;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }
}
