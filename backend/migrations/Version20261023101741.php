<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261023101741 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create initial schema (users, cartes_membre, activites, salles) with InnoDB';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE activites (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, description LONGTEXT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE cartes_membre (id INT AUTO_INCREMENT NOT NULL, numero_affiliation VARCHAR(20) NOT NULL, date_emission DATETIME NOT NULL, date_expiration DATETIME NOT NULL, statut VARCHAR(20) NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_F0968FE9A5CD1AFF (numero_affiliation), UNIQUE INDEX UNIQ_F0968FE9A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE salles (id INT AUTO_INCREMENT NOT NULL, nom VARCHAR(100) NOT NULL, adresse VARCHAR(255) NOT NULL, code_postal VARCHAR(10) NOT NULL, ville VARCHAR(50) NOT NULL, description LONGTEXT NOT NULL, telephone VARCHAR(30) NOT NULL, capacite INT NOT NULL, equipements VARCHAR(255) DEFAULT NULL, latitude NUMERIC(10, 7) DEFAULT NULL, longitude NUMERIC(10, 7) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, gestionnaire_id INT NOT NULL, INDEX IDX_799D45AA6885AC1B (gestionnaire_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE users (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, firstname VARCHAR(50) NOT NULL, lastname VARCHAR(50) NOT NULL, phone VARCHAR(30) DEFAULT NULL, accent_color VARCHAR(20) NOT NULL, is_active TINYINT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE cartes_membre ADD CONSTRAINT FK_F0968FE9A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE salles ADD CONSTRAINT FK_799D45AA6885AC1B FOREIGN KEY (gestionnaire_id) REFERENCES users (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cartes_membre DROP FOREIGN KEY FK_F0968FE9A76ED395');
        $this->addSql('ALTER TABLE salles DROP FOREIGN KEY FK_799D45AA6885AC1B');
        $this->addSql('DROP TABLE activites');
        $this->addSql('DROP TABLE cartes_membre');
        $this->addSql('DROP TABLE salles');
        $this->addSql('DROP TABLE users');
    }
}
