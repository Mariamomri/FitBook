<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261023171117 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create horaires table with ManyToOne relation to salles';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE horaires (id INT AUTO_INCREMENT NOT NULL, jour VARCHAR(20) NOT NULL, heure_ouverture TIME NOT NULL, heure_fermeture TIME NOT NULL, salle_id INT NOT NULL, INDEX IDX_39B7118FDC304035 (salle_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE horaires ADD CONSTRAINT FK_39B7118FDC304035 FOREIGN KEY (salle_id) REFERENCES salles (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE horaires DROP FOREIGN KEY FK_39B7118FDC304035');
        $this->addSql('DROP TABLE horaires');
    }
}
