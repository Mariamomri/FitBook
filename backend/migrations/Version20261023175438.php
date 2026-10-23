<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261023175438 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create disponibilites_coaches table with ManyToOne relation to coaches';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE disponibilites_coaches (id INT AUTO_INCREMENT NOT NULL, jour VARCHAR(20) NOT NULL, heure_debut TIME NOT NULL, heure_fin TIME NOT NULL, coach_id INT NOT NULL, INDEX IDX_3C510F1B3C105691 (coach_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE disponibilites_coaches ADD CONSTRAINT FK_3C510F1B3C105691 FOREIGN KEY (coach_id) REFERENCES coaches (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE disponibilites_coaches DROP FOREIGN KEY FK_3C510F1B3C105691');
        $this->addSql('DROP TABLE disponibilites_coaches');
    }
}
