<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use App\Entity\Traits\Timestampable; //importe le trait Timestampable
use ApiPlatform\Metadata\ApiResource; //pour utiliser API Platform et exposer l'entité User comme ressource API
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity; //pour utiliser l'annotation UniqueEntity et vérifier que l'email est unique
use Symfony\Component\Validator\Constraints as Assert;

// pour utiliser les annotations d'API Platform pour définir les opérations disponibles sur l'entité User
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\State\UserPasswordHasher;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[UniqueEntity(fields: ['email'], message: 'Un compte existe déjà avec cet email')]

#[ApiResource(operations: [
    new GetCollection(security: "is_granted('ROLE_ADMIN')"),
    new Get(security: "is_granted('ROLE_ADMIN') or object == user"),
    new Post(processor: UserPasswordHasher::class),
    new Patch(security: "is_granted('ROLE_ADMIN') or object == user", processor: UserPasswordHasher::class),
    new Delete(security: "is_granted('ROLE_ADMIN')")
])] //pour exposer l'entité via API Platform

#[ORM\HasLifecycleCallbacks] // dit à Doctrine de lire les PrePersist et PreUpdate de cette classe. Sans cette ligne, les dates ne se remplissent pas.
#[ORM\Table(name: "users")]

class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    #[Assert\NotBlank()] // pour vérifier que l'email n'est pas vide
    #[Assert\Email()] // pour vérifier que l'email est bien formé
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ApiProperty(securityPostDenormalize: "is_granted('ROLE_ADMIN')")] // seul un admin peut modifier ce champ
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    #[ApiProperty(readable: false, writable: false)] // le hash n'est jamais renvoyé ni envoyé par l'API
    private ?string $password = null;

    // mot de passe en clair reçu de l'API : pas de #[ORM\Column] → jamais enregistré en base
    #[ApiProperty(readable: false)]
    #[Assert\Length(min: 6)]
    private ?string $plainPassword = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank()] // pour vérifier que le prénom n'est pas vide
    #[Assert\Length(min: 2, max: 50)]
    private ?string $firstname = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank()]
    #[Assert\Length(min: 2, max: 50)]
    private ?string $lastname = null;

    #[ORM\Column(length: 30, nullable: true)]
    #[Assert\Length(max: 30)] // pas plus de 30 caractères
    private ?string $phone = null;

    #[ORM\Column(length: 20)]
    #[Assert\NotBlank()]
    #[Assert\Choice(choices: ['vert', 'orange', 'jaune', 'bleu', 'rose', 'rouge'], message: 'Couleur non valide.')]
    private ?string $accentColor = null;

    #[ApiProperty(securityPostDenormalize: "is_granted('ROLE_ADMIN')")] // seul un admin peut modifier ce champ
    #[ORM\Column]
    private ?bool $isActive = true;  //pour éviter qu'un utilisateur qui vient d'être créé soit désactivé par défaut, je le mets à true

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?CarteMembre $carteMembre = null;

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?Coach $coach = null;

    /**
     * @var Collection<int, Salle>
     */
    #[ORM\OneToMany(targetEntity: Salle::class, mappedBy: 'gestionnaire', orphanRemoval: true)]
    private Collection $salles;

    /**
     * @var Collection<int, Reservation>
     */
    #[ORM\OneToMany(targetEntity: Reservation::class, mappedBy: 'user', orphanRemoval: true)]
    private Collection $reservations;

    /**
     * @var Collection<int, Salle>
     */
    #[ORM\ManyToMany(targetEntity: Salle::class)]
    #[ORM\JoinTable(name: 'favori_salle')] // association « favori_salle » du MCD (users 0,n — salle 0,n)
    private Collection $favoriSalles;

    /**
     * @var Collection<int, Cours>
     */
    #[ORM\ManyToMany(targetEntity: Cours::class)]
    #[ORM\JoinTable(name: 'favori_cours')] // association « favori_cours » du MCD (users 0,n — cours 0,n)
    private Collection $favoriCours;

    /**
     * @var Collection<int, Coach>
     */
    #[ORM\ManyToMany(targetEntity: Coach::class)]
    #[ORM\JoinTable(name: 'favori_coach')] // association « favori_coach » du MCD (users 0,n — coach 0,n)
    private Collection $favoriCoachs;

    #[ApiProperty(securityPostDenormalize: "is_granted('ROLE_ADMIN')")] // seul un admin peut modifier ce champ
    #[ORM\Column]
    private ?bool $isVerified = false; // un nouvel utilisateur n'a pas encore confirmé son email

    public function __construct()
    {
        $this->salles = new ArrayCollection();
        $this->reservations = new ArrayCollection();
        $this->favoriSalles = new ArrayCollection();
        $this->favoriCours = new ArrayCollection();
        $this->favoriCoachs = new ArrayCollection();
    }

    use Timestampable; //utilise le trait dans la classe

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): static
    {
        $this->plainPassword = $plainPassword;

        return $this;
    }

    /**
     * Ensure the session doesn't contain actual password hashes by CRC32C-hashing them, as supported since Symfony 7.3.
     */
    public function __serialize(): array
    {
        $data = (array) $this;
        $data["\0" . self::class . "\0password"] = hash('crc32c', $this->password);

        return $data;
    }

    #[\Deprecated]
    public function eraseCredentials(): void
    {
        // @deprecated, to be removed when upgrading to Symfony 8
    }

    public function getFirstname(): ?string
    {
        return $this->firstname;
    }

    public function setFirstname(string $firstname): static
    {
        $this->firstname = $firstname;

        return $this;
    }

    public function getLastname(): ?string
    {
        return $this->lastname;
    }

    public function setLastname(string $lastname): static
    {
        $this->lastname = $lastname;

        return $this;
    }

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(?string $phone): static
    {
        $this->phone = $phone;

        return $this;
    }

    public function getAccentColor(): ?string
    {
        return $this->accentColor;
    }

    public function setAccentColor(string $accentColor): static
    {
        $this->accentColor = $accentColor;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }

    public function getCarteMembre(): ?CarteMembre
    {
        return $this->carteMembre;
    }

    public function setCarteMembre(CarteMembre $carteMembre): static
    {
        // set the owning side of the relation if necessary
        if ($carteMembre->getUser() !== $this) {
            $carteMembre->setUser($this);
        }

        $this->carteMembre = $carteMembre;

        return $this;
    }

    /**
     * @return Collection<int, Salle>
     */
    public function getSalles(): Collection
    {
        return $this->salles;
    }

    public function addSalle(Salle $salle): static
    {
        if (!$this->salles->contains($salle)) {
            $this->salles->add($salle);
            $salle->setGestionnaire($this);
        }

        return $this;
    }

    public function removeSalle(Salle $salle): static
    {
        if ($this->salles->removeElement($salle)) {
            // set the owning side to null (unless already changed)
            if ($salle->getGestionnaire() === $this) {
                $salle->setGestionnaire(null);
            }
        }

        return $this;
    }

    public function getCoach(): ?Coach
    {
        return $this->coach;
    }

    public function setCoach(Coach $coach): static
    {
        // set the owning side of the relation if necessary
        if ($coach->getUser() !== $this) {
            $coach->setUser($this);
        }

        $this->coach = $coach;

        return $this;
    }

    /**
     * @return Collection<int, Reservation>
     */
    public function getReservations(): Collection
    {
        return $this->reservations;
    }

    public function addReservation(Reservation $reservation): static
    {
        if (!$this->reservations->contains($reservation)) {
            $this->reservations->add($reservation);
            $reservation->setUser($this);
        }

        return $this;
    }

    public function removeReservation(Reservation $reservation): static
    {
        if ($this->reservations->removeElement($reservation)) {
            // set the owning side to null (unless already changed)
            if ($reservation->getUser() === $this) {
                $reservation->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Salle>
     */
    public function getFavoriSalles(): Collection
    {
        return $this->favoriSalles;
    }

    public function addFavoriSalle(Salle $salle): static
    {
        if (!$this->favoriSalles->contains($salle)) {
            $this->favoriSalles->add($salle);
        }

        return $this;
    }

    public function removeFavoriSalle(Salle $salle): static
    {
        $this->favoriSalles->removeElement($salle);

        return $this;
    }

    /**
     * @return Collection<int, Cours>
     */
    public function getFavoriCours(): Collection
    {
        return $this->favoriCours;
    }

    public function addFavoriCour(Cours $cour): static
    {
        if (!$this->favoriCours->contains($cour)) {
            $this->favoriCours->add($cour);
        }

        return $this;
    }

    public function removeFavoriCour(Cours $cour): static
    {
        $this->favoriCours->removeElement($cour);

        return $this;
    }

    /**
     * @return Collection<int, Coach>
     */
    public function getFavoriCoachs(): Collection
    {
        return $this->favoriCoachs;
    }

    public function addFavoriCoach(Coach $coach): static
    {
        if (!$this->favoriCoachs->contains($coach)) {
            $this->favoriCoachs->add($coach);
        }

        return $this;
    }

    public function removeFavoriCoach(Coach $coach): static
    {
        $this->favoriCoachs->removeElement($coach);

        return $this;
    }

    public function isVerified(): ?bool
    {
        return $this->isVerified;
    }

    public function setIsVerified(bool $isVerified): static
    {
        $this->isVerified = $isVerified;

        return $this;
    }
}
