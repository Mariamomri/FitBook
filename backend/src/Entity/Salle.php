<?php

namespace App\Entity;

use App\Repository\SalleRepository;
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
use ApiPlatform\Metadata\ApiProperty;
use Symfony\Component\HttpFoundation\File\File; // fichier envoyé lors de l'upload
use Vich\UploaderBundle\Mapping\Attribute as Vich; // pour l'upload des photos
use Symfony\Component\Validator\Constraints as Assert; // règles de validation des données envoyées

#[ORM\Entity(repositoryClass: SalleRepository::class)]
#[ORM\HasLifecycleCallbacks]
#[ORM\Table(name: 'salles')]
//pour exposer l'entité via l'API Platform
// Lecture publique ; le gestionnaire ne gère que ses propres salles, l'admin gère tout
#[Vich\Uploadable] // la salle peut avoir une photo
#[ApiResource(operations: [
    new GetCollection(),
    new Get(),
    new Post(securityPostDenormalize: "is_granted('ROLE_ADMIN') or (is_granted('ROLE_SALLE') and object.getGestionnaire() == user)"),
    new Patch(security: "is_granted('ROLE_ADMIN') or object.getGestionnaire() == user", securityPostDenormalize: "is_granted('ROLE_ADMIN') or object.getGestionnaire() == user"),
    new Delete(security: "is_granted('ROLE_ADMIN') or object.getGestionnaire() == user")
])]
class Salle
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    #[Assert\NotBlank(message: 'Le nom de la salle est obligatoire.')]
    #[Assert\Length(min: 2, max: 100, minMessage: 'Le nom doit contenir au moins {{ limit }} caractères.')]
    private ?string $nom = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: "L'adresse est obligatoire.")]
    #[Assert\Length(max: 255)]
    private ?string $adresse = null;

    #[ORM\Column(length: 10)]
    #[Assert\NotBlank(message: 'Le code postal est obligatoire.')]
    #[Assert\Regex(pattern: '/^\d{4,5}$/', message: 'Code postal invalide (4 ou 5 chiffres).')]
    private ?string $codePostal = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank(message: 'La ville est obligatoire.')]
    #[Assert\Length(min: 2, max: 50)]
    private ?string $ville = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank(message: 'La description est obligatoire.')]
    private ?string $description = null;

    #[ORM\Column(length: 30)]
    #[Assert\NotBlank(message: 'Le téléphone est obligatoire.')]
    #[Assert\Regex(pattern: '/^[0-9 +.\/()-]{6,30}$/', message: 'Numéro de téléphone invalide.')]
    private ?string $telephone = null;

    #[ORM\Column]
    #[Assert\NotNull(message: 'La capacité est obligatoire.')]
    #[Assert\Positive(message: 'La capacité doit être supérieure à 0.')]
    private ?int $capacite = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Assert\Length(max: 255)]
    private ?string $equipements = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 7, nullable: true)]
    #[Assert\Range(min: -90, max: 90, notInRangeMessage: 'Latitude invalide.')]
    private ?string $latitude = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 7, nullable: true)]
    #[Assert\Range(min: -180, max: 180, notInRangeMessage: 'Longitude invalide.')]
    private ?string $longitude = null;


    // fichier photo reçu (pas enregistré en base, utilisé seulement pendant l'upload)
    #[Vich\UploadableField(mapping: 'salles', fileNameProperty: 'imageName', size: 'imageSize')]
    #[ApiProperty(readable: false, writable: false)]
    private ?File $imageFile = null;

    // nom du fichier enregistré dans public/images/salles
    #[ORM\Column(nullable: true)]
    #[ApiProperty(writable: false)]
    private ?string $imageName = null;

    // taille du fichier en octets
    #[ORM\Column(nullable: true)]
    #[ApiProperty(writable: false)]
    private ?int $imageSize = null;

    #[ORM\ManyToOne(inversedBy: 'salles')]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotNull(message: 'Le gestionnaire est obligatoire.')]
    private ?User $gestionnaire = null;

    /**
     * @var Collection<int, Horaire>
     */
    #[ORM\OneToMany(targetEntity: Horaire::class, mappedBy: 'salle', orphanRemoval: true)]
    private Collection $horaires;

    /**
     * @var Collection<int, Cours>
     */
    #[ORM\OneToMany(targetEntity: Cours::class, mappedBy: 'salle', orphanRemoval: true)]
    private Collection $cours;

    /**
     * @var Collection<int, Avis>
     */
    #[ORM\OneToMany(targetEntity: Avis::class, mappedBy: 'salle')]
    private Collection $avis;

    public function __construct()
    {
        $this->horaires = new ArrayCollection();
        $this->cours = new ArrayCollection();
        $this->avis = new ArrayCollection();
    }

    use Timestampable;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getAdresse(): ?string
    {
        return $this->adresse;
    }

    public function setAdresse(string $adresse): static
    {
        $this->adresse = $adresse;

        return $this;
    }

    public function getCodePostal(): ?string
    {
        return $this->codePostal;
    }

    public function setCodePostal(string $codePostal): static
    {
        $this->codePostal = $codePostal;

        return $this;
    }

    public function getVille(): ?string
    {
        return $this->ville;
    }

    public function setVille(string $ville): static
    {
        $this->ville = $ville;

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

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(string $telephone): static
    {
        $this->telephone = $telephone;

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

    public function getEquipements(): ?string
    {
        return $this->equipements;
    }

    public function setEquipements(?string $equipements): static
    {
        $this->equipements = $equipements;

        return $this;
    }

    public function getLatitude(): ?string
    {
        return $this->latitude;
    }

    public function setLatitude(?string $latitude): static
    {
        $this->latitude = $latitude;

        return $this;
    }

    public function getLongitude(): ?string
    {
        return $this->longitude;
    }

    public function setLongitude(?string $longitude): static
    {
        $this->longitude = $longitude;

        return $this;
    }

    public function getGestionnaire(): ?User
    {
        return $this->gestionnaire;
    }

    public function setGestionnaire(?User $gestionnaire): static
    {
        $this->gestionnaire = $gestionnaire;

        return $this;
    }

    /**
     * @return Collection<int, Horaire>
     */
    public function getHoraires(): Collection
    {
        return $this->horaires;
    }

    public function addHoraire(Horaire $horaire): static
    {
        if (!$this->horaires->contains($horaire)) {
            $this->horaires->add($horaire);
            $horaire->setSalle($this);
        }

        return $this;
    }

    public function removeHoraire(Horaire $horaire): static
    {
        if ($this->horaires->removeElement($horaire)) {
            // set the owning side to null (unless already changed)
            if ($horaire->getSalle() === $this) {
                $horaire->setSalle(null);
            }
        }

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
            $cour->setSalle($this);
        }

        return $this;
    }

    public function removeCour(Cours $cour): static
    {
        if ($this->cours->removeElement($cour)) {
            // set the owning side to null (unless already changed)
            if ($cour->getSalle() === $this) {
                $cour->setSalle(null);
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
            $avi->setSalle($this);
        }

        return $this;
    }

    public function removeAvi(Avis $avi): static
    {
        if ($this->avis->removeElement($avi)) {
            // set the owning side to null (unless already changed)
            if ($avi->getSalle() === $this) {
                $avi->setSalle(null);
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
}
