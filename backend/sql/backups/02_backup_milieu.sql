-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: fitbook_db
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activites`
--

DROP TABLE IF EXISTS `activites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activites`
--

LOCK TABLES `activites` WRITE;
/*!40000 ALTER TABLE `activites` DISABLE KEYS */;
/*!40000 ALTER TABLE `activites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avis_notes`
--

DROP TABLE IF EXISTS `avis_notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avis_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `note` int NOT NULL,
  `commentaire` longtext NOT NULL,
  `statut` varchar(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `reservation_id` int NOT NULL,
  `salle_id` int DEFAULT NULL,
  `coach_id` int DEFAULT NULL,
  `cours_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_76D327F2B83297E7` (`reservation_id`),
  KEY `IDX_76D327F2DC304035` (`salle_id`),
  KEY `IDX_76D327F23C105691` (`coach_id`),
  KEY `IDX_76D327F27ECF78B0` (`cours_id`),
  CONSTRAINT `FK_76D327F23C105691` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`),
  CONSTRAINT `FK_76D327F27ECF78B0` FOREIGN KEY (`cours_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `FK_76D327F2B83297E7` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`),
  CONSTRAINT `FK_76D327F2DC304035` FOREIGN KEY (`salle_id`) REFERENCES `salles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avis_notes`
--

LOCK TABLES `avis_notes` WRITE;
/*!40000 ALTER TABLE `avis_notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `avis_notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cartes_membre`
--

DROP TABLE IF EXISTS `cartes_membre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cartes_membre` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_affiliation` varchar(20) NOT NULL,
  `date_emission` datetime NOT NULL,
  `date_expiration` datetime NOT NULL,
  `statut` varchar(20) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_F0968FE9A5CD1AFF` (`numero_affiliation`),
  UNIQUE KEY `UNIQ_F0968FE9A76ED395` (`user_id`),
  CONSTRAINT `FK_F0968FE9A76ED395` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartes_membre`
--

LOCK TABLES `cartes_membre` WRITE;
/*!40000 ALTER TABLE `cartes_membre` DISABLE KEYS */;
/*!40000 ALTER TABLE `cartes_membre` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coaches`
--

DROP TABLE IF EXISTS `coaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coaches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `biographie` longtext NOT NULL,
  `annees_experience` int NOT NULL,
  `tarif` decimal(6,2) NOT NULL,
  `certifications` longtext,
  `langues` varchar(100) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_C4131765A76ED395` (`user_id`),
  CONSTRAINT `FK_C4131765A76ED395` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coaches`
--

LOCK TABLES `coaches` WRITE;
/*!40000 ALTER TABLE `coaches` DISABLE KEYS */;
/*!40000 ALTER TABLE `coaches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  `niveau` varchar(50) NOT NULL,
  `capacite` int NOT NULL,
  `prix` decimal(6,2) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `salle_id` int NOT NULL,
  `activite_id` int NOT NULL,
  `coach_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_A9A55A4CDC304035` (`salle_id`),
  KEY `IDX_A9A55A4C9B0F88B1` (`activite_id`),
  KEY `IDX_A9A55A4C3C105691` (`coach_id`),
  CONSTRAINT `FK_A9A55A4C3C105691` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`),
  CONSTRAINT `FK_A9A55A4C9B0F88B1` FOREIGN KEY (`activite_id`) REFERENCES `activites` (`id`),
  CONSTRAINT `FK_A9A55A4CDC304035` FOREIGN KEY (`salle_id`) REFERENCES `salles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilites_coaches`
--

DROP TABLE IF EXISTS `disponibilites_coaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilites_coaches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jour` varchar(20) NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `coach_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_3C510F1B3C105691` (`coach_id`),
  CONSTRAINT `FK_3C510F1B3C105691` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilites_coaches`
--

LOCK TABLES `disponibilites_coaches` WRITE;
/*!40000 ALTER TABLE `disponibilites_coaches` DISABLE KEYS */;
/*!40000 ALTER TABLE `disponibilites_coaches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctrine_migration_versions`
--

DROP TABLE IF EXISTS `doctrine_migration_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctrine_migration_versions` (
  `version` varchar(191) NOT NULL,
  `executed_at` datetime DEFAULT NULL,
  `execution_time` int DEFAULT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctrine_migration_versions`
--

LOCK TABLES `doctrine_migration_versions` WRITE;
/*!40000 ALTER TABLE `doctrine_migration_versions` DISABLE KEYS */;
INSERT INTO `doctrine_migration_versions` VALUES ('DoctrineMigrations\\Version20261023101741','2026-10-23 10:19:09',422),('DoctrineMigrations\\Version20261023171117','2026-10-23 17:12:04',264),('DoctrineMigrations\\Version20261023173445','2026-10-23 17:40:30',460),('DoctrineMigrations\\Version20261023174707','2026-10-23 17:48:43',433),('DoctrineMigrations\\Version20261023175133','2026-10-23 17:53:31',192),('DoctrineMigrations\\Version20261023175438','2026-10-23 17:56:08',171),('DoctrineMigrations\\Version20261023180110','2026-10-23 18:02:33',289),('DoctrineMigrations\\Version20261023181335','2026-10-23 18:16:50',560),('DoctrineMigrations\\Version20261023182707','2026-10-23 18:31:24',876);
/*!40000 ALTER TABLE `doctrine_migration_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enseigner`
--

DROP TABLE IF EXISTS `enseigner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enseigner` (
  `coach_id` int NOT NULL,
  `activite_id` int NOT NULL,
  PRIMARY KEY (`coach_id`,`activite_id`),
  KEY `IDX_663E85CD3C105691` (`coach_id`),
  KEY `IDX_663E85CD9B0F88B1` (`activite_id`),
  CONSTRAINT `FK_663E85CD3C105691` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_663E85CD9B0F88B1` FOREIGN KEY (`activite_id`) REFERENCES `activites` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enseigner`
--

LOCK TABLES `enseigner` WRITE;
/*!40000 ALTER TABLE `enseigner` DISABLE KEYS */;
/*!40000 ALTER TABLE `enseigner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favori_coach`
--

DROP TABLE IF EXISTS `favori_coach`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favori_coach` (
  `user_id` int NOT NULL,
  `coach_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`coach_id`),
  KEY `IDX_A19542FDA76ED395` (`user_id`),
  KEY `IDX_A19542FD3C105691` (`coach_id`),
  CONSTRAINT `FK_A19542FD3C105691` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_A19542FDA76ED395` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favori_coach`
--

LOCK TABLES `favori_coach` WRITE;
/*!40000 ALTER TABLE `favori_coach` DISABLE KEYS */;
/*!40000 ALTER TABLE `favori_coach` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favori_cours`
--

DROP TABLE IF EXISTS `favori_cours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favori_cours` (
  `user_id` int NOT NULL,
  `cours_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`cours_id`),
  KEY `IDX_6306A3ADA76ED395` (`user_id`),
  KEY `IDX_6306A3AD7ECF78B0` (`cours_id`),
  CONSTRAINT `FK_6306A3AD7ECF78B0` FOREIGN KEY (`cours_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_6306A3ADA76ED395` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favori_cours`
--

LOCK TABLES `favori_cours` WRITE;
/*!40000 ALTER TABLE `favori_cours` DISABLE KEYS */;
/*!40000 ALTER TABLE `favori_cours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favori_salle`
--

DROP TABLE IF EXISTS `favori_salle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favori_salle` (
  `user_id` int NOT NULL,
  `salle_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`salle_id`),
  KEY `IDX_D05B516DA76ED395` (`user_id`),
  KEY `IDX_D05B516DDC304035` (`salle_id`),
  CONSTRAINT `FK_D05B516DA76ED395` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_D05B516DDC304035` FOREIGN KEY (`salle_id`) REFERENCES `salles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favori_salle`
--

LOCK TABLES `favori_salle` WRITE;
/*!40000 ALTER TABLE `favori_salle` DISABLE KEYS */;
/*!40000 ALTER TABLE `favori_salle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horaires`
--

DROP TABLE IF EXISTS `horaires`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horaires` (
  `id` int NOT NULL AUTO_INCREMENT,
  `jour` varchar(20) NOT NULL,
  `heure_ouverture` time NOT NULL,
  `heure_fermeture` time NOT NULL,
  `salle_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_39B7118FDC304035` (`salle_id`),
  CONSTRAINT `FK_39B7118FDC304035` FOREIGN KEY (`salle_id`) REFERENCES `salles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horaires`
--

LOCK TABLES `horaires` WRITE;
/*!40000 ALTER TABLE `horaires` DISABLE KEYS */;
/*!40000 ALTER TABLE `horaires` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(20) NOT NULL,
  `statut` varchar(20) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int NOT NULL,
  `seance_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_4DA239F55AE19E` (`numero`),
  KEY `IDX_4DA239A76ED395` (`user_id`),
  KEY `IDX_4DA239E3797A94` (`seance_id`),
  CONSTRAINT `FK_4DA239A76ED395` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_4DA239E3797A94` FOREIGN KEY (`seance_id`) REFERENCES `seances` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salles`
--

DROP TABLE IF EXISTS `salles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `adresse` varchar(255) NOT NULL,
  `code_postal` varchar(10) NOT NULL,
  `ville` varchar(50) NOT NULL,
  `description` longtext NOT NULL,
  `telephone` varchar(30) NOT NULL,
  `capacite` int NOT NULL,
  `equipements` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `gestionnaire_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_799D45AA6885AC1B` (`gestionnaire_id`),
  CONSTRAINT `FK_799D45AA6885AC1B` FOREIGN KEY (`gestionnaire_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salles`
--

LOCK TABLES `salles` WRITE;
/*!40000 ALTER TABLE `salles` DISABLE KEYS */;
/*!40000 ALTER TABLE `salles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seances`
--

DROP TABLE IF EXISTS `seances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date_debut` datetime NOT NULL,
  `date_fin` datetime NOT NULL,
  `statut` varchar(20) NOT NULL,
  `cours_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_FC699FF17ECF78B0` (`cours_id`),
  CONSTRAINT `FK_FC699FF17ECF78B0` FOREIGN KEY (`cours_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seances`
--

LOCK TABLES `seances` WRITE;
/*!40000 ALTER TABLE `seances` DISABLE KEYS */;
/*!40000 ALTER TABLE `seances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(180) NOT NULL,
  `roles` json NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `accent_color` varchar(20) NOT NULL,
  `is_active` tinyint NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_IDENTIFIER_EMAIL` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-23 20:50:47
