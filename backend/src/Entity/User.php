<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use App\Entity\Traits\Timestampable; //collegato il trait
use ApiPlatform\Metadata\ApiResource; //per usare api platform e esporre l'entità User come risorsa API

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]

#[ApiResource] //per esporre l'entità via l'API Platform

#[ORM\HasLifecycleCallbacks] // dice a Doctrine di guardare i PrePersist e PreUpdate di questa classe. Senza questa riga le date non si riempiono.
#[ORM\Table(name: "users")]

class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[ORM\Column(length: 50)]
    private ?string $firstname = null;

    #[ORM\Column(length: 50)]
    private ?string $lastname = null;

    #[ORM\Column(length: 30, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(length: 20)]
    private ?string $accentColor = null;

    #[ORM\Column]
    private ?bool $isActive = true;  //per evitare che un utente appena creato sia disabilitato di default, lo imposto a true

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

    public function __construct()
    {
        $this->salles = new ArrayCollection();
        $this->reservations = new ArrayCollection();
        $this->favoriSalles = new ArrayCollection();
        $this->favoriCours = new ArrayCollection();
        $this->favoriCoachs = new ArrayCollection();
    }

    use Timestampable; //uso il trait in classe

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
}
