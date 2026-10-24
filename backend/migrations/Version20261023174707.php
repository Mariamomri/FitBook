<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261023174707 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create courses table with ManyToOne to salles, activites and coaches';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE courses (id INT AUTO_INCREMENT NOT NULL, titre VARCHAR(100) NOT NULL, description LONGTEXT NOT NULL, niveau VARCHAR(50) NOT NULL, capacite INT NOT NULL, prix NUMERIC(6, 2) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, salle_id INT NOT NULL, activite_id INT NOT NULL, coach_id INT DEFAULT NULL, INDEX IDX_A9A55A4CDC304035 (salle_id), INDEX IDX_A9A55A4C9B0F88B1 (activite_id), INDEX IDX_A9A55A4C3C105691 (coach_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE courses ADD CONSTRAINT FK_A9A55A4CDC304035 FOREIGN KEY (salle_id) REFERENCES salles (id)');
        $this->addSql('ALTER TABLE courses ADD CONSTRAINT FK_A9A55A4C9B0F88B1 FOREIGN KEY (activite_id) REFERENCES activites (id)');
        $this->addSql('ALTER TABLE courses ADD CONSTRAINT FK_A9A55A4C3C105691 FOREIGN KEY (coach_id) REFERENCES coaches (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE courses DROP FOREIGN KEY FK_A9A55A4CDC304035');
        $this->addSql('ALTER TABLE courses DROP FOREIGN KEY FK_A9A55A4C9B0F88B1');
        $this->addSql('ALTER TABLE courses DROP FOREIGN KEY FK_A9A55A4C3C105691');
        $this->addSql('DROP TABLE courses');
    }
}
