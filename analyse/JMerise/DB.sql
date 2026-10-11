-- ----------------------------------------------------------
-- Script MYSQL pour mcd 
-- ----------------------------------------------------------


-- ----------------------------
-- Table: activites
-- ----------------------------
CREATE TABLE activites (
  id_activite INT NOT NULL AUTO_INCREMENT,
  nom_activite VARCHAR(100) NOT NULL,
  description_activite TEXT NOT NULL,
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
  photo VARCHAR(255) NOT NULL,
  is_verified TINYINT(1) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  CONSTRAINT users_PK PRIMARY KEY (id_user)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: coachs
-- ----------------------------
CREATE TABLE coachs (
  id_coach INT NOT NULL AUTO_INCREMENT,
  biographie_coach TEXT NOT NULL,
  id_user INT NOT NULL,
  CONSTRAINT coachs_PK PRIMARY KEY (id_coach),
  CONSTRAINT coachs_id_user_FK FOREIGN KEY (id_user) REFERENCES users (id_user)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: salles
-- ----------------------------
CREATE TABLE salles (
  id_salle INT NOT NULL AUTO_INCREMENT,
  nom_salle VARCHAR(100) NOT NULL,
  adresse_salle VARCHAR(255) NOT NULL,
  ville_salle VARCHAR(50) NOT NULL,
  description_salle TEXT NOT NULL,
  telephone_salle VARCHAR(30) NOT NULL,
  photo_salle VARCHAR(255) NOT NULL,
  capacite_salle INT NOT NULL,
  id_user INT NOT NULL,
  CONSTRAINT salles_PK PRIMARY KEY (id_salle),
  CONSTRAINT salles_id_user_FK FOREIGN KEY (id_user) REFERENCES users (id_user)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: favorise_salle
-- ----------------------------
CREATE TABLE favorise_salle (
  id_salle INT NOT NULL,
  id_user INT NOT NULL,
  CONSTRAINT favorise_salle_PK PRIMARY KEY (id_salle, id_user),
  CONSTRAINT favorise_salle_id_salle_FK FOREIGN KEY (id_salle) REFERENCES salles (id_salle),
  CONSTRAINT favorise_salle_id_user_FK FOREIGN KEY (id_user) REFERENCES users (id_user)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: cours
-- ----------------------------
CREATE TABLE cours (
  id_cours INT NOT NULL AUTO_INCREMENT,
  titre_cours VARCHAR(100) NOT NULL,
  description_cours TEXT NOT NULL,
  niveau_cours VARCHAR(50) NOT NULL,
  duree_cours INT NOT NULL,
  capacite_cours INT NOT NULL,
  prix_cours DECIMAL(6,2) NOT NULL,
  id_salle INT NOT NULL,
  id_activite INT NOT NULL,
  CONSTRAINT cours_PK PRIMARY KEY (id_cours),
  CONSTRAINT cours_id_salle_FK FOREIGN KEY (id_salle) REFERENCES salles (id_salle),
  CONSTRAINT cours_id_activite_FK FOREIGN KEY (id_activite) REFERENCES activites (id_activite)
)ENGINE=InnoDB;


-- ----------------------------
-- Table: favorise_coach
-- ----------------------------
CREATE TABLE favorise_coach (

/******************************************************************************************************
*                                                                                                     *
*      -->    Désolé, il faut activer cette version pour voir la suite du script !                    *
*                                                                                                     *
*******************************************************************************************************/