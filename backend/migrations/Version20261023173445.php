<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261023173445 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create coaches table, OneToOne to users and ManyToMany enseigner with activites';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE coaches (id INT AUTO_INCREMENT NOT NULL, biographie LONGTEXT NOT NULL, annees_experience INT NOT NULL, tarif NUMERIC(6, 2) NOT NULL, certifications LONGTEXT DEFAULT NULL, langues VARCHAR(100) NOT NULL, user_id INT NOT NULL, UNIQUE INDEX UNIQ_C4131765A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('CREATE TABLE enseigner (coach_id INT NOT NULL, activite_id INT NOT NULL, INDEX IDX_663E85CD3C105691 (coach_id), INDEX IDX_663E85CD9B0F88B1 (activite_id), PRIMARY KEY (coach_id, activite_id)) DEFAULT CHARACTER SET utf8mb4 ENGINE = InnoDB');
        $this->addSql('ALTER TABLE coaches ADD CONSTRAINT FK_C4131765A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE enseigner ADD CONSTRAINT FK_663E85CD3C105691 FOREIGN KEY (coach_id) REFERENCES coaches (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE enseigner ADD CONSTRAINT FK_663E85CD9B0F88B1 FOREIGN KEY (activite_id) REFERENCES activites (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE coaches DROP FOREIGN KEY FK_C4131765A76ED395');
        $this->addSql('ALTER TABLE enseigner DROP FOREIGN KEY FK_663E85CD3C105691');
        $this->addSql('ALTER TABLE enseigner DROP FOREIGN KEY FK_663E85CD9B0F88B1');
        $this->addSql('DROP TABLE coaches');
        $this->addSql('DROP TABLE enseigner');
    }
}
