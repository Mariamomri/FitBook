<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261023093609 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create cartes_membre table with OneToOne relation to users';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE cartes_membre (id INT AUTO_INCREMENT NOT NULL, numero_affiliation VARCHAR(20) NOT NULL, date_emission DATETIME NOT NULL, date_expiration DATETIME NOT NULL, statut VARCHAR(20) NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_F0968FE9A5CD1AFF (numero_affiliation), UNIQUE INDEX UNIQ_F0968FE9A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE cartes_membre ADD CONSTRAINT FK_F0968FE9A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE cartes_membre DROP FOREIGN KEY FK_F0968FE9A76ED395');
        $this->addSql('DROP TABLE cartes_membre');
    }
}
