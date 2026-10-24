<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261023175133 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create seances table with ManyToOne relation to cours';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE seances (id INT AUTO_INCREMENT NOT NULL, date_debut DATETIME NOT NULL, date_fin DATETIME NOT NULL, statut VARCHAR(20) NOT NULL, cours_id INT NOT NULL, INDEX IDX_FC699FF17ECF78B0 (cours_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE seances ADD CONSTRAINT FK_FC699FF17ECF78B0 FOREIGN KEY (cours_id) REFERENCES courses (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE seances DROP FOREIGN KEY FK_FC699FF17ECF78B0');
        $this->addSql('DROP TABLE seances');
    }
}
