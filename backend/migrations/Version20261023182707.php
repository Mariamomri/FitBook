<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261023182707 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create favori_salle, favori_cours and favori_coach ManyToMany tables with users, salles, courses and coaches';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE favori_salle (user_id INT NOT NULL, salle_id INT NOT NULL, INDEX IDX_D05B516DA76ED395 (user_id), INDEX IDX_D05B516DDC304035 (salle_id), PRIMARY KEY (user_id, salle_id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE favori_cours (user_id INT NOT NULL, cours_id INT NOT NULL, INDEX IDX_6306A3ADA76ED395 (user_id), INDEX IDX_6306A3AD7ECF78B0 (cours_id), PRIMARY KEY (user_id, cours_id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE favori_coach (user_id INT NOT NULL, coach_id INT NOT NULL, INDEX IDX_A19542FDA76ED395 (user_id), INDEX IDX_A19542FD3C105691 (coach_id), PRIMARY KEY (user_id, coach_id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE favori_salle ADD CONSTRAINT FK_D05B516DA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE favori_salle ADD CONSTRAINT FK_D05B516DDC304035 FOREIGN KEY (salle_id) REFERENCES salles (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE favori_cours ADD CONSTRAINT FK_6306A3ADA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE favori_cours ADD CONSTRAINT FK_6306A3AD7ECF78B0 FOREIGN KEY (cours_id) REFERENCES courses (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE favori_coach ADD CONSTRAINT FK_A19542FDA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE favori_coach ADD CONSTRAINT FK_A19542FD3C105691 FOREIGN KEY (coach_id) REFERENCES coaches (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE favori_salle DROP FOREIGN KEY FK_D05B516DA76ED395');
        $this->addSql('ALTER TABLE favori_salle DROP FOREIGN KEY FK_D05B516DDC304035');
        $this->addSql('ALTER TABLE favori_cours DROP FOREIGN KEY FK_6306A3ADA76ED395');
        $this->addSql('ALTER TABLE favori_cours DROP FOREIGN KEY FK_6306A3AD7ECF78B0');
        $this->addSql('ALTER TABLE favori_coach DROP FOREIGN KEY FK_A19542FDA76ED395');
        $this->addSql('ALTER TABLE favori_coach DROP FOREIGN KEY FK_A19542FD3C105691');
        $this->addSql('DROP TABLE favori_salle');
        $this->addSql('DROP TABLE favori_cours');
        $this->addSql('DROP TABLE favori_coach');
    }
}
