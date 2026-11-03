-- ----------------------------------------------------------
-- Script MYSQL pour mcd 
-- ----------------------------------------------------------


-- ----------------------------
-- Table: activites
-- ----------------------------
CREATE TABLE activites (
  id_activite INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  CONSTRAINT activites_PK PRIMARY KEY (id_activite)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: users
-- ----------------------------
CREATE TABLE users (
  id_user INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(180) NOT NULL,
  roles JSON NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  accent_color VARCHAR(20) NOT NULL,
  image_name VARCHAR(255) NOT NULL,
  image_size INT NOT NULL,
  is_verified TINYINT(1) NOT NULL,
  is_active TINYINT(1) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT users_PK PRIMARY KEY (id_user)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: cartes_membre
-- ----------------------------
CREATE TABLE cartes_membre (
  id_carte_membre INT NOT NULL AUTO_INCREMENT,
  numero_affiliation VARCHAR(20) NOT NULL,
  date_emission DATETIME NOT NULL,
  date_expiration DATETIME NOT NULL,
  statut VARCHAR(20) NOT NULL,
  id_user INT NOT NULL,
  CONSTRAINT cartes_membre_PK PRIMARY KEY (id_carte_membre),
  CONSTRAINT cartes_membre_id_user_FK FOREIGN KEY (id_user) REFERENCES users (id_user)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: reset_password_request
-- ----------------------------
CREATE TABLE reset_password_request (
  id_reset_password_request INT NOT NULL AUTO_INCREMENT,
  selector VARCHAR(20) NOT NULL,
  hashed_token VARCHAR(100) NOT NULL,
  requested_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  id_user INT NOT NULL,
  CONSTRAINT reset_password_request_PK PRIMARY KEY (id_reset_password_request),
  CONSTRAINT reset_password_request_id_user_FK FOREIGN KEY (id_user) REFERENCES users (id_user)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: coaches
-- ----------------------------
CREATE TABLE coaches (
  id_coach INT NOT NULL AUTO_INCREMENT,
  biographie TEXT NOT NULL,
  annees_experience INT NOT NULL,
  tarif DECIMAL(6,2) NOT NULL,
  certifications TEXT NOT NULL,
  langues VARCHAR(100) NOT NULL,
  image_name VARCHAR(255) NOT NULL,
  image_size INT NOT NULL,
  updated_at DATETIME NOT NULL,
  id_user INT NOT NULL,
  CONSTRAINT coaches_PK PRIMARY KEY (id_coach),
  CONSTRAINT coaches_id_user_FK FOREIGN KEY (id_user) REFERENCES users (id_user)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: salles
-- ----------------------------
CREATE TABLE salles (
  id_salle INT NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  adresse VARCHAR(255) NOT NULL,
  code_postal VARCHAR(10) NOT NULL,
  ville VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  telephone VARCHAR(30) NOT NULL,
  capacite INT NOT NULL,
  equipements VARCHAR(255) NOT NULL,

/******************************************************************************************************
*                                                                                                     *
*      -->    Désolé, il faut activer cette version pour voir la suite du script !                    *
*                                                                                                     *
*******************************************************************************************************/