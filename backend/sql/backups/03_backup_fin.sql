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
) ENGINE=InnoDB AUTO_INCREMENT=2016 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activites`
--

LOCK TABLES `activites` WRITE;
/*!40000 ALTER TABLE `activites` DISABLE KEYS */;
INSERT INTO `activites` VALUES (2001,'Musculation','Renforcement musculaire avec poids libres et machines.'),(2002,'Hatha Yoga','Yoga doux basé sur les postures et la respiration.'),(2003,'Pilates','Renforcement des muscles profonds et de la posture.'),(2004,'CrossFit','Entraînement fonctionnel à haute intensité.'),(2005,'Boxe','Technique de frappe, cardio et coordination.'),(2006,'Zumba','Danse fitness sur des rythmes latinos.'),(2015,'Yoga','Cours de yoga pour tous niveaux');
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
) ENGINE=InnoDB AUTO_INCREMENT=2006 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avis_notes`
--

LOCK TABLES `avis_notes` WRITE;
/*!40000 ALTER TABLE `avis_notes` DISABLE KEYS */;
INSERT INTO `avis_notes` VALUES (2001,5,'Coach très pédagogue, parfait pour débuter.','publie','2026-10-12 12:00:00','2026-10-12 12:00:00',2001,NULL,2001,NULL),(2002,4,'Très bonne séance de yoga, salle calme et agréable.','publie','2026-10-16 09:00:00','2026-10-16 09:00:00',2002,NULL,NULL,2003),(2003,5,'Salle propre et bien équipée, ring impeccable.','publie','2026-10-18 10:00:00','2026-10-18 10:00:00',2003,2002,NULL,NULL),(2004,3,'Séance intense mais un peu trop de monde.','publie','2026-10-20 18:00:00','2026-10-20 18:00:00',2004,NULL,NULL,2002);
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
) ENGINE=InnoDB AUTO_INCREMENT=2005 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cartes_membre`
--

LOCK TABLES `cartes_membre` WRITE;
/*!40000 ALTER TABLE `cartes_membre` DISABLE KEYS */;
INSERT INTO `cartes_membre` VALUES (2001,'FB-2026-002007','2026-09-01 10:00:00','2027-09-01 10:00:00','active',2007),(2002,'FB-2026-002008','2026-09-15 10:00:00','2027-09-15 10:00:00','active',2008),(2003,'FB-2026-002009','2026-10-01 10:00:00','2027-10-01 10:00:00','active',2009),(2004,'FB-2026-002010','2025-06-01 10:00:00','2026-06-01 10:00:00','expiree',2010);
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
  `image_name` varchar(255) DEFAULT NULL,
  `image_size` int DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_C4131765A76ED395` (`user_id`),
  CONSTRAINT `FK_C4131765A76ED395` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2006 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coaches`
--

LOCK TABLES `coaches` WRITE;
/*!40000 ALTER TABLE `coaches` DISABLE KEYS */;
INSERT INTO `coaches` VALUES (2001,'Coach en musculation et CrossFit, ancien athlète de haut niveau.',8,45.00,'BPJEPS AF, CrossFit Level 2','Français, Anglais',2004,'coach-2001.jpg',NULL,NULL),(2002,'Professeure de yoga et pilates, passionnée par le bien-être.',6,40.00,'RYT 500 Yoga Alliance','Français, Arabe, Anglais',2005,'coach-2002.jpg',NULL,NULL),(2003,'Coach de boxe et de cardio, ancien boxeur amateur.',10,50.00,NULL,'Néerlandais, Français',2006,'coach-2003.jpg',NULL,NULL),(2004,'Coach polyvalent : renforcement musculaire, préparation physique et remise en forme.',10,56.00,'BPJEPS AGFF, Préparateur physique','Portugais, Anglais, Français',2022,'supereroe-coach-rettangolare-6ae65877d5cd8431299704.png',1545704,'2026-10-31 21:07:03');
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
) ENGINE=InnoDB AUTO_INCREMENT=2020 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (2001,'Muscu débutant','Apprendre les mouvements de base en sécurité.','Débutant',12,15.00,'2026-10-25 17:35:13','2026-10-25 17:35:13',2001,2001,2001),(2002,'CrossFit WOD','Entraînement du jour en groupe, intensité élevée.','Avancé',15,18.00,'2026-10-25 17:35:13','2026-10-25 17:35:13',2001,2004,2001),(2003,'Hatha Yoga du soir','Séance relaxante pour finir la journée.','Tous niveaux',20,12.00,'2026-10-25 17:35:13','2026-10-25 17:35:13',2003,2002,2002),(2004,'Pilates renforcement','Gainage et posture sur tapis.','Intermédiaire',15,14.00,'2026-10-25 17:35:13','2026-10-25 17:35:13',2003,2003,2002),(2005,'Boxe initiation','Découvrir la boxe anglaise : garde, déplacements, frappes.','Débutant',10,16.00,'2026-10-25 17:35:13','2026-10-25 17:35:13',2002,2005,2003),(2006,'Cardio boxe','Enchaînements de frappes pour brûler des calories.','Intermédiaire',2,16.00,'2026-10-25 17:35:13','2026-10-25 17:35:13',2002,2005,2003),(2007,'Zumba party','Danse fitness dans la bonne humeur.','Tous niveaux',25,10.00,'2026-10-25 17:35:13','2026-10-25 17:35:13',2002,2006,2003),(2008,'Musculation libre','Accès encadré à la salle de musculation.','Tous niveaux',30,8.00,'2026-10-25 17:35:13','2026-10-25 17:35:13',2001,2001,NULL),(2015,'Musculation pro','Programme de musculation avancé : charges lourdes, techniques de progression et suivi personnalisé.','Avancé',30,23.00,'2026-10-31 19:42:34','2026-10-31 19:42:34',2010,2001,2003),(2019,'Yoga du matin','Séance douce pour bien commencer la journée','Débutant',15,12.00,'2026-11-01 22:34:07','2026-11-01 22:34:07',2013,2015,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=2010 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilites_coaches`
--

LOCK TABLES `disponibilites_coaches` WRITE;
/*!40000 ALTER TABLE `disponibilites_coaches` DISABLE KEYS */;
INSERT INTO `disponibilites_coaches` VALUES (2001,'lundi','08:00:00','12:00:00',2001),(2002,'mercredi','17:00:00','21:00:00',2001),(2003,'mardi','09:00:00','13:00:00',2002),(2004,'jeudi','18:00:00','20:00:00',2002),(2005,'vendredi','17:00:00','21:00:00',2003),(2006,'samedi','10:00:00','14:00:00',2003),(2007,'mardi','09:00:00','12:00:00',2004);
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
INSERT INTO `doctrine_migration_versions` VALUES ('DoctrineMigrations\\Version20261023101741','2026-10-23 10:19:09',422),('DoctrineMigrations\\Version20261023171117','2026-10-23 17:12:04',264),('DoctrineMigrations\\Version20261023173445','2026-10-23 17:40:30',460),('DoctrineMigrations\\Version20261023174707','2026-10-23 17:48:43',433),('DoctrineMigrations\\Version20261023175133','2026-10-23 17:53:31',192),('DoctrineMigrations\\Version20261023175438','2026-10-23 17:56:08',171),('DoctrineMigrations\\Version20261023180110','2026-10-23 18:02:33',289),('DoctrineMigrations\\Version20261023181335','2026-10-23 18:16:50',560),('DoctrineMigrations\\Version20261023182707','2026-10-23 18:31:24',876),('DoctrineMigrations\\Version20261025110453','2026-10-25 11:05:24',104),('DoctrineMigrations\\Version20261031135943','2026-10-31 14:01:42',209),('DoctrineMigrations\\Version20261101154856','2026-11-01 15:52:00',189);
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
INSERT INTO `enseigner` VALUES (2001,2001),(2001,2004),(2002,2002),(2002,2003),(2003,2005),(2003,2006);
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
INSERT INTO `favori_coach` VALUES (2007,2001),(2008,2002),(2009,2003),(2013,2001),(2013,2003),(2022,2004);
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
INSERT INTO `favori_cours` VALUES (2007,2002),(2008,2003),(2008,2004),(2010,2007),(2013,2001);
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
INSERT INTO `favori_salle` VALUES (2007,2001),(2008,2003),(2009,2002),(2013,2001),(2013,2010);
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
) ENGINE=InnoDB AUTO_INCREMENT=2019 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horaires`
--

LOCK TABLES `horaires` WRITE;
/*!40000 ALTER TABLE `horaires` DISABLE KEYS */;
INSERT INTO `horaires` VALUES (2001,'lundi','07:00:00','22:00:00',2001),(2002,'mardi','07:00:00','22:00:00',2001),(2003,'mercredi','07:00:00','22:00:00',2001),(2004,'jeudi','07:00:00','22:00:00',2001),(2005,'vendredi','07:00:00','21:00:00',2001),(2006,'samedi','09:00:00','18:00:00',2001),(2007,'lundi','08:00:00','21:00:00',2002),(2008,'mardi','08:00:00','21:00:00',2002),(2009,'mercredi','08:00:00','21:00:00',2002),(2010,'jeudi','08:00:00','21:00:00',2002),(2011,'vendredi','08:00:00','20:00:00',2002),(2012,'samedi','10:00:00','16:00:00',2002),(2013,'lundi','09:00:00','20:00:00',2003),(2014,'mardi','09:00:00','20:00:00',2003),(2015,'mercredi','09:00:00','20:00:00',2003),(2016,'jeudi','09:00:00','20:00:00',2003),(2017,'vendredi','09:00:00','19:00:00',2003),(2018,'samedi','10:00:00','14:00:00',2003);
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
) ENGINE=InnoDB AUTO_INCREMENT=2020 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES (2001,'FB-2026-R0001','confirmee','2026-10-10 10:00:00','2026-10-10 10:00:00',2007,2001),(2002,'FB-2026-R0002','confirmee','2026-10-11 11:00:00','2026-10-11 11:00:00',2008,2002),(2003,'FB-2026-R0003','confirmee','2026-10-14 09:30:00','2026-10-14 09:30:00',2009,2003),(2004,'FB-2026-R0004','confirmee','2026-10-18 15:00:00','2026-10-18 15:00:00',2007,2004),(2005,'FB-2026-R0005','annulee','2026-10-12 08:00:00','2026-10-13 08:00:00',2009,2002),(2006,'FB-2026-R0006','confirmee','2026-10-22 10:00:00','2026-10-22 10:00:00',2007,2005),(2007,'FB-2026-R0007','confirmee','2026-10-23 12:00:00','2026-10-23 12:00:00',2008,2008),(2008,'FB-2026-R0008','confirmee','2026-10-23 13:00:00','2026-10-23 13:00:00',2009,2010),(2009,'FB-2026-R0009','confirmee','2026-10-24 09:00:00','2026-10-24 09:00:00',2007,2011),(2010,'FB-2026-R0010','confirmee','2026-10-24 10:00:00','2026-10-24 10:00:00',2008,2011),(2011,'FB-2026-R0011','confirmee','2026-10-24 18:00:00','2026-10-24 18:00:00',2009,2012),(2014,'FB-2026-6A5666','confirmee','2026-11-01 16:28:07','2026-11-01 16:28:07',2013,2007),(2015,'FB-2026-60A2EB','confirmee','2026-11-01 18:09:44','2026-11-01 18:09:44',2013,2005),(2019,'FB-2026-CF6759','annulee','2026-11-01 22:34:12','2026-11-01 22:34:14',1000,2005);
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reset_password_request`
--

DROP TABLE IF EXISTS `reset_password_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reset_password_request` (
  `id` int NOT NULL AUTO_INCREMENT,
  `selector` varchar(20) NOT NULL,
  `hashed_token` varchar(100) NOT NULL,
  `requested_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_7CE748AA76ED395` (`user_id`),
  CONSTRAINT `FK_7CE748AA76ED395` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reset_password_request`
--

LOCK TABLES `reset_password_request` WRITE;
/*!40000 ALTER TABLE `reset_password_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `reset_password_request` ENABLE KEYS */;
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
  `image_name` varchar(255) DEFAULT NULL,
  `image_size` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_799D45AA6885AC1B` (`gestionnaire_id`),
  CONSTRAINT `FK_799D45AA6885AC1B` FOREIGN KEY (`gestionnaire_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2014 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salles`
--

LOCK TABLES `salles` WRITE;
/*!40000 ALTER TABLE `salles` DISABLE KEYS */;
INSERT INTO `salles` VALUES (2001,'FitBook Bruxelles Centre','Boulevard Anspach 45','1000','Bruxelles','Grande salle moderne au cœur de Bruxelles.','02 511 22 33',80,'Machines cardio, poids libres, vestiaires, douches',50.8476000,4.3499000,'2026-10-25 17:35:13','2026-10-31 20:14:16',2001,'aalo-lens-uynhrrm63uo-unsplash-6ae64c189c283829886800.jpg',1883487),(2002,'FitBook Liège Guillemins','Rue des Guillemins 12','4000','Liège','Salle lumineuse à deux pas de la gare.','04 222 33 44',60,'Ring de boxe, tapis, vestiaires',50.6243000,5.5668000,'2026-10-25 17:35:13','2026-10-25 17:35:13',2002,'salle-2002.jpg',NULL),(2003,'FitBook Anvers Zuid','Leopold de Waelplaats 8','2000','Anvers','Studio spécialisé yoga, pilates et danse.','03 233 44 55',40,'Tapis de yoga, miroirs, sono',51.2085000,4.3920000,'2026-10-25 17:35:13','2026-10-25 17:35:13',2003,'salle-2003.jpg',NULL),(2010,'Osseghem salle','Rue Osseghem 53','1203','Bruxelles','Salle de quartier à Osseghem : plateau musculation, espace cardio et grand parking.','02 410 53 41',200,'Parking, poids libres, machines cardio, vestiaires',50.8570328,4.3252212,'2026-10-31 19:36:50','2026-10-31 19:50:26',2021,'salle-nature-6ae643537d2dd896098403.jpg',325031),(2013,'FitBook Ixelles','Rue du Sport 10','1050','Bruxelles','Salle de sport moderne','02 123 45 67',50,NULL,NULL,NULL,'2026-11-01 22:34:06','2026-11-01 22:34:06',1000,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=2027 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seances`
--

LOCK TABLES `seances` WRITE;
/*!40000 ALTER TABLE `seances` DISABLE KEYS */;
INSERT INTO `seances` VALUES (2001,'2026-10-12 09:00:00','2026-10-12 10:00:00','terminee',2001),(2002,'2026-10-15 18:00:00','2026-10-15 19:00:00','terminee',2003),(2003,'2026-10-17 18:00:00','2026-10-17 19:00:00','terminee',2005),(2004,'2026-10-20 12:00:00','2026-10-20 13:00:00','terminee',2002),(2005,'2026-11-02 09:00:00','2026-11-02 10:00:00','ouverte',2001),(2006,'2026-11-04 09:00:00','2026-11-04 10:00:00','ouverte',2001),(2007,'2026-11-03 12:00:00','2026-11-03 13:00:00','ouverte',2002),(2008,'2026-11-05 18:00:00','2026-11-05 19:00:00','ouverte',2003),(2009,'2026-11-06 10:00:00','2026-11-06 11:00:00','ouverte',2004),(2010,'2026-11-06 18:00:00','2026-11-06 19:00:00','ouverte',2005),(2011,'2026-11-07 17:00:00','2026-11-07 18:00:00','complete',2006),(2012,'2026-11-07 19:00:00','2026-11-07 20:00:00','ouverte',2007),(2013,'2026-11-09 14:00:00','2026-11-09 16:00:00','ouverte',2008),(2014,'2026-11-12 18:00:00','2026-11-12 19:00:00','ouverte',2003),(2026,'2026-11-05 09:00:00','2026-11-05 10:00:00','ouverte',2019);
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
  `is_verified` tinyint NOT NULL,
  `image_name` varchar(255) DEFAULT NULL,
  `image_size` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNIQ_IDENTIFIER_EMAIL` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2026 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1000,'admin@fitbook.be','[\"ROLE_ADMIN\"]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Julien','Admin',NULL,'orange',1,'2026-11-01 23:33:29','2026-11-01 23:33:29',1,NULL,NULL),(2001,'sophie.martin@fitbook.be','[\"ROLE_SALLE\"]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Sophie','Martin','0470 11 22 33','orange',1,'2026-10-25 17:35:13','2026-10-25 17:35:13',1,NULL,NULL),(2002,'karim.benali@fitbook.be','[\"ROLE_SALLE\"]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Karim','Benali','0471 22 33 44','vert',1,'2026-10-25 17:35:13','2026-10-25 17:35:13',1,NULL,NULL),(2003,'pieter.claes@fitbook.be','[\"ROLE_SALLE\"]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Pieter','Claes','0472 33 44 55','vert',1,'2026-10-25 17:35:13','2026-10-25 17:35:13',1,NULL,NULL),(2004,'lucas.dubois@fitbook.be','[\"ROLE_COACH\"]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Lucas','Dubois','0473 44 55 66','rouge',1,'2026-10-25 17:35:13','2026-10-25 17:35:13',1,NULL,NULL),(2005,'amina.elidrissi@fitbook.be','[\"ROLE_COACH\"]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Amina','El Idrissi','0474 55 66 77','rose',1,'2026-10-25 17:35:13','2026-10-25 17:35:13',1,NULL,NULL),(2006,'thomas.peeters@fitbook.be','[\"ROLE_COACH\"]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Thomas','Peeters','0475 66 77 88','jaune',1,'2026-10-25 17:35:13','2026-10-25 17:35:13',1,NULL,NULL),(2007,'emma.janssens@gmail.com','[]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Emma','Janssens','0476 77 88 99','rose',1,'2026-10-25 17:35:13','2026-10-31 22:00:54',1,'il-1080xn-4480944190-9n3l-6ae609673a590675190953.webp',71096),(2008,'nora.haddad@gmail.com','[]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Nora','Haddad',NULL,'vert',1,'2026-10-25 17:35:13','2026-10-25 17:35:13',1,NULL,NULL),(2009,'julien.lambert@gmail.com','[]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Julien','Lambert','0477 88 99 00','vert',1,'2026-10-25 17:35:13','2026-10-25 17:35:13',1,NULL,NULL),(2010,'lea.willems@gmail.com','[]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Léa','Willems',NULL,'rouge',1,'2026-10-25 17:35:13','2026-10-25 17:35:13',1,NULL,NULL),(2011,'yassine.moreau@gmail.com','[]','$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG','Yassine','Moreau','0478 99 00 11','rose',1,'2026-10-25 17:35:13','2026-10-25 17:35:13',0,NULL,NULL),(2013,'mary@fitbook.be','[]','$2y$13$6DGfQgXuo.ujW2i4ULr03us14Fg2n6b.H0HAVsJ4vyopwLyhjM1Ea','Mary','Omri',NULL,'rose',1,'2026-10-28 21:20:13','2026-11-01 16:14:23',1,'222731379-6ae76258adbbd513464650.png',186311),(2021,'mike@fitbook.be','[\"ROLE_SALLE\"]','$2y$13$I3BfYuGc5j7NXuO5JvyGHuNOz/hALeXZxvhi8a8j8iahrCp7H9bJy','Mike','Laurent','0476 77 88 99','jaune',1,'2026-10-31 17:19:28','2026-10-31 17:24:54',1,'516e838653661d2224da94324a7e1225-w200-6ae6245b67419650878407.webp',49286),(2022,'vitor@fitbook.be','[\"ROLE_COACH\"]','$2y$13$WcR0nSO3eIG3fyDcypFEmOvFFHZDSu3XAEGnE2sFUzZ/iJrlsM3Ki','Vitor','Santos','+32 35 54 76','bleu',1,'2026-10-31 20:29:05','2026-10-31 22:02:30',1,'profilo-supereroe-coach-6ae65699438b4793450291.png',1558871);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'fitbook_db'
--
/*!50003 DROP PROCEDURE IF EXISTS `getNoteMoyenneSalle` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`julien`@`localhost` PROCEDURE `getNoteMoyenneSalle`(IN idSalle INT, OUT moyenne DECIMAL(3,1))
BEGIN
        SELECT AVG(note) INTO moyenne
        FROM avis_notes
        WHERE salle_id = idSalle;
    END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getPlacesRestantes` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`julien`@`localhost` PROCEDURE `getPlacesRestantes`(IN idSeance INT)
BEGIN
        SELECT courses.capacite - COUNT(reservations.id) AS places_restantes
        FROM seances
        JOIN courses ON courses.id = seances.cours_id
        LEFT JOIN reservations ON reservations.seance_id = seances.id AND reservations.statut = 'confirmee'
        WHERE seances.id = idSeance
        GROUP BY courses.capacite;
    END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `getProchainesSeances` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
CREATE DEFINER=`julien`@`localhost` PROCEDURE `getProchainesSeances`()
BEGIN
        SELECT seances.id, courses.titre, seances.date_debut, seances.date_fin
        FROM seances
        JOIN courses ON courses.id = seances.cours_id
        WHERE seances.date_debut > NOW()
        ORDER BY seances.date_debut;
    END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-02  0:29:40
