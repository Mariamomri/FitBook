# FitBook

Plateforme web de réservation de salles de sport, de cours et de coachs.
Projet réalisé dans le cadre de l'UAA MI08 — Produire un projet Web.

## Présentation

FitBook permet à un utilisateur de rechercher une salle, un cours ou un coach grâce à une barre de
recherche et des filtres avancés, puis de réserver une séance et de gérer ses réservations, ses favoris
et ses avis. Quatre types de comptes sont disponibles : sportif, coach, salle / gestionnaire et
administrateur, chacun avec son propre espace et ses propres droits.

## Stack technique

- **Frontend** : Angular 21, TypeScript, Tailwind-CSS, CSS3
- **Backend** : PHP / Symfony, API Platform
- **Base de données** : MySQL
- **Authentification** : JWT (LexikJWTAuthenticationBundle), mots de passe hachés (bcrypt)+
- **Tests** : Postman / Newman (API), k6 (tests de charge)
- **Déploiement** : Vercel (frontend), AlwaysData (backend + base de données)

## Fonctionnalités principales

- Inscription, connexion, confirmation par e-mail, réinitialisation de mot de passe
- Recherche de salles / cours / coachs avec filtres
- Réservation d'une séance, annulation, historique
- Favoris, avis et notes
- Espace coach : séances, horaires, disponibilités, calendrier
- Espace salle / gestionnaire : salles, cours, activités, horaires, capacités
- Espace administrateur : gestion des utilisateurs, salles, coachs, modération des avis
- Carte de membre
- QR code de confirmation de réservation
- Personnalisation de la couleur du site par utilisateur

## Installation locale

### Prérequis

- Node.js (dernière version LTS) et npm
- PHP 8.2+, Composer
- MySQL
- Symfony CLI (recommandé)

### Backend

```bash
cd backend
composer install
cp .env .env.local   # puis adapter DATABASE_URL, MAILER_DSN, JWT_PASSPHRASE
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
php bin/console lexik:jwt:generate-keypair
symfony server:start
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

L'application est alors accessible sur `http://localhost:4200`, l'API sur `http://localhost:8000`.

## Comptes de démonstration

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur | admin@fitbook.be | julien123 |
| Coach | mike@fitbook.be | mike123 |
| Salle / gestionnaire | vitor@fitbook.be | vitor123 |
| Sportif | yanis@fitbook.be | yanis@123 |

## Tests

- **API** : collection Postman « Test_Api_FitBook » exécutée avec Newman — 31 requêtes, 31 assertions
  réussies, 0 échec (voir `backend/tests` et le cahier des charges, chapitre 09).
- **Charge** : test k6 (`backend/tests/stress/test-stress.js`), rapport dans
  `backend/tests/stress/rapport-stress-dev.html`.
- Liste de tests fonctionnels détaillée : voir `Liste_des_tests_FitBook.docx`.

## Sauvegardes

Trois sauvegardes complètes de la base de données ont été réalisées pendant le développement (début,
milieu, fin), conservées dans `backend/sql/backups/`.

## Analyse

Les documents d'analyse (MCD, MLD, diagramme de classes, cas d'utilisation, user stories, maquettes) se
trouvent dans le dossier `analyse/` et dans le cahier des charges.

## Les liens utiles :

- Site en ligne : https://fit-book-tau.vercel.app
- Dépôt GitHub : https://github.com/Mariamomri/FitBook
- Trello : https://trello.com/b/RnNUL2B7/fitbook
- Maquette Figma : https://www.figma.com/proto/RNarGXC1TB5BIHiGDol844/FitBook?node-id=138-2&starting-point-node-id=138-2&scaling=scale-down-width&hide-ui=1
- Présentation Canva : https://canva.link/klx9lgboonqv952

## Auteure

Mariam Omri — UAA MI08
