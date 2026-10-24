<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261023181335 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create avis_notes table with ManyToOne to reservations, salles, coaches and courses';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE avis_notes (id INT AUTO_INCREMENT NOT NULL, note INT NOT NULL, commentaire LONGTEXT NOT NULL, statut VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, reservation_id INT NOT NULL, salle_id INT DEFAULT NULL, coach_id INT DEFAULT NULL, cours_id INT DEFAULT NULL, INDEX IDX_76D327F2B83297E7 (reservation_id), INDEX IDX_76D327F2DC304035 (salle_id), INDEX IDX_76D327F23C105691 (coach_id), INDEX IDX_76D327F27ECF78B0 (cours_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE avis_notes ADD CONSTRAINT FK_76D327F2B83297E7 FOREIGN KEY (reservation_id) REFERENCES reservations (id)');
        $this->addSql('ALTER TABLE avis_notes ADD CONSTRAINT FK_76D327F2DC304035 FOREIGN KEY (salle_id) REFERENCES salles (id)');
        $this->addSql('ALTER TABLE avis_notes ADD CONSTRAINT FK_76D327F23C105691 FOREIGN KEY (coach_id) REFERENCES coaches (id)');
        $this->addSql('ALTER TABLE avis_notes ADD CONSTRAINT FK_76D327F27ECF78B0 FOREIGN KEY (cours_id) REFERENCES courses (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE avis_notes DROP FOREIGN KEY FK_76D327F2B83297E7');
        $this->addSql('ALTER TABLE avis_notes DROP FOREIGN KEY FK_76D327F2DC304035');
        $this->addSql('ALTER TABLE avis_notes DROP FOREIGN KEY FK_76D327F23C105691');
        $this->addSql('ALTER TABLE avis_notes DROP FOREIGN KEY FK_76D327F27ECF78B0');
        $this->addSql('DROP TABLE avis_notes');
    }
}
