-- Jeu de données de démonstration FitBook (pour la présentation et le déploiement)
-- Lancement : mysql -u julien -p fitbook_db < sql/donnees_demo.sql
-- Le script peut être relancé : il supprime d'abord les données de démo (id >= 2000).
-- Tous les comptes de démo ont le mot de passe : julien123

SET NAMES utf8mb4;

-- 1. Suppression des anciennes données de démo (enfants d'abord, parents ensuite)
DELETE FROM avis_notes WHERE id >= 2000;
DELETE FROM reservations WHERE id >= 2000;
DELETE FROM favori_salle WHERE user_id >= 2000;
DELETE FROM favori_cours WHERE user_id >= 2000;
DELETE FROM favori_coach WHERE user_id >= 2000;
DELETE FROM seances WHERE id >= 2000;
DELETE FROM disponibilites_coaches WHERE id >= 2000;
DELETE FROM courses WHERE id >= 2000;
DELETE FROM enseigner WHERE coach_id >= 2000;
DELETE FROM coaches WHERE id >= 2000;
DELETE FROM horaires WHERE id >= 2000;
DELETE FROM salles WHERE id >= 2000;
DELETE FROM cartes_membre WHERE id >= 2000;
DELETE FROM activites WHERE id >= 2000;
DELETE FROM users WHERE id >= 2000;

-- 2. Utilisateurs : 3 gestionnaires de salle, 3 coachs, 5 sportifs
INSERT INTO users (id, email, roles, password, firstname, lastname, phone, accent_color, is_active, is_verified, created_at, updated_at) VALUES
(2001, 'sophie.martin@fitbook.be', '["ROLE_SALLE"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Sophie', 'Martin', '0470 11 22 33', '#FF6B00', 1, 1, NOW(), NOW()),
(2002, 'karim.benali@fitbook.be', '["ROLE_SALLE"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Karim', 'Benali', '0471 22 33 44', '#2E86DE', 1, 1, NOW(), NOW()),
(2003, 'pieter.claes@fitbook.be', '["ROLE_SALLE"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Pieter', 'Claes', '0472 33 44 55', '#10AC84', 1, 1, NOW(), NOW()),
(2004, 'lucas.dubois@fitbook.be', '["ROLE_COACH"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Lucas', 'Dubois', '0473 44 55 66', '#EE5253', 1, 1, NOW(), NOW()),
(2005, 'amina.elidrissi@fitbook.be', '["ROLE_COACH"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Amina', 'El Idrissi', '0474 55 66 77', '#8E44AD', 1, 1, NOW(), NOW()),
(2006, 'thomas.peeters@fitbook.be', '["ROLE_COACH"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Thomas', 'Peeters', '0475 66 77 88', '#F39C12', 1, 1, NOW(), NOW()),
(2007, 'emma.janssens@gmail.com', '[]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Emma', 'Janssens', '0476 77 88 99', '#FF6B00', 1, 1, NOW(), NOW()),
(2008, 'nora.haddad@gmail.com', '[]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Nora', 'Haddad', NULL, '#2E86DE', 1, 1, NOW(), NOW()),
(2009, 'julien.lambert@gmail.com', '[]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Julien', 'Lambert', '0477 88 99 00', '#10AC84', 1, 1, NOW(), NOW()),
(2010, 'lea.willems@gmail.com', '[]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Léa', 'Willems', NULL, '#EE5253', 1, 1, NOW(), NOW()),
(2011, 'yassine.moreau@gmail.com', '[]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Yassine', 'Moreau', '0478 99 00 11', '#8E44AD', 1, 0, NOW(), NOW());
-- Yassine n'a pas confirmé son email (is_verified = 0) : utile pour montrer le blocage de la réservation

-- 3. Cartes de membre des sportifs
INSERT INTO cartes_membre (id, numero_affiliation, date_emission, date_expiration, statut, user_id) VALUES
(2001, 'FB-2026-002007', '2026-09-01 10:00:00', '2027-09-01 10:00:00', 'active', 2007),
(2002, 'FB-2026-002008', '2026-09-15 10:00:00', '2027-09-15 10:00:00', 'active', 2008),
(2003, 'FB-2026-002009', '2026-10-01 10:00:00', '2027-10-01 10:00:00', 'active', 2009),
(2004, 'FB-2026-002010', '2025-06-01 10:00:00', '2026-06-01 10:00:00', 'expiree', 2010);

-- 4. Activités
INSERT INTO activites (id, nom, description) VALUES
(2001, 'Musculation', 'Renforcement musculaire avec poids libres et machines.'),
(2002, 'Hatha Yoga', 'Yoga doux basé sur les postures et la respiration.'),
(2003, 'Pilates', 'Renforcement des muscles profonds et de la posture.'),
(2004, 'CrossFit', 'Entraînement fonctionnel à haute intensité.'),
(2005, 'Boxe', 'Technique de frappe, cardio et coordination.'),
(2006, 'Zumba', 'Danse fitness sur des rythmes latinos.');

-- 5. Salles (une salle par gestionnaire)
INSERT INTO salles (id, nom, adresse, code_postal, ville, description, telephone, capacite, equipements, latitude, longitude, created_at, updated_at, gestionnaire_id) VALUES
(2001, 'FitBook Bruxelles Centre', 'Boulevard Anspach 45', '1000', 'Bruxelles', 'Grande salle moderne au cœur de Bruxelles.', '02 511 22 33', 80, 'Machines cardio, poids libres, vestiaires, douches', 50.8476000, 4.3499000, NOW(), NOW(), 2001),
(2002, 'FitBook Liège Guillemins', 'Rue des Guillemins 12', '4000', 'Liège', 'Salle lumineuse à deux pas de la gare.', '04 222 33 44', 60, 'Ring de boxe, tapis, vestiaires', 50.6243000, 5.5668000, NOW(), NOW(), 2002),
(2003, 'FitBook Anvers Zuid', 'Leopold de Waelplaats 8', '2000', 'Anvers', 'Studio spécialisé yoga, pilates et danse.', '03 233 44 55', 40, 'Tapis de yoga, miroirs, sono', 51.2085000, 4.3920000, NOW(), NOW(), 2003);

-- 6. Horaires d'ouverture (dimanche fermé)
INSERT INTO horaires (id, jour, heure_ouverture, heure_fermeture, salle_id) VALUES
(2001, 'lundi', '07:00:00', '22:00:00', 2001), (2002, 'mardi', '07:00:00', '22:00:00', 2001), (2003, 'mercredi', '07:00:00', '22:00:00', 2001),
(2004, 'jeudi', '07:00:00', '22:00:00', 2001), (2005, 'vendredi', '07:00:00', '21:00:00', 2001), (2006, 'samedi', '09:00:00', '18:00:00', 2001),
(2007, 'lundi', '08:00:00', '21:00:00', 2002), (2008, 'mardi', '08:00:00', '21:00:00', 2002), (2009, 'mercredi', '08:00:00', '21:00:00', 2002),
(2010, 'jeudi', '08:00:00', '21:00:00', 2002), (2011, 'vendredi', '08:00:00', '20:00:00', 2002), (2012, 'samedi', '10:00:00', '16:00:00', 2002),
(2013, 'lundi', '09:00:00', '20:00:00', 2003), (2014, 'mardi', '09:00:00', '20:00:00', 2003), (2015, 'mercredi', '09:00:00', '20:00:00', 2003),
(2016, 'jeudi', '09:00:00', '20:00:00', 2003), (2017, 'vendredi', '09:00:00', '19:00:00', 2003), (2018, 'samedi', '10:00:00', '14:00:00', 2003);

-- 7. Profils coach
INSERT INTO coaches (id, biographie, annees_experience, tarif, certifications, langues, user_id) VALUES
(2001, 'Coach en musculation et CrossFit, ancien athlète de haut niveau.', 8, 45.00, 'BPJEPS AF, CrossFit Level 2', 'Français, Anglais', 2004),
(2002, 'Professeure de yoga et pilates, passionnée par le bien-être.', 6, 40.00, 'RYT 500 Yoga Alliance', 'Français, Arabe, Anglais', 2005),
(2003, 'Coach de boxe et de cardio, ancien boxeur amateur.', 10, 50.00, NULL, 'Néerlandais, Français', 2006);

-- 8. Activités enseignées par chaque coach (ManyToMany enseigner)
INSERT INTO enseigner (coach_id, activite_id) VALUES
(2001, 2001), (2001, 2004),
(2002, 2002), (2002, 2003),
(2003, 2005), (2003, 2006);

-- 9. Disponibilités des coachs
INSERT INTO disponibilites_coaches (id, jour, heure_debut, heure_fin, coach_id) VALUES
(2001, 'lundi', '08:00:00', '12:00:00', 2001), (2002, 'mercredi', '17:00:00', '21:00:00', 2001),
(2003, 'mardi', '09:00:00', '13:00:00', 2002), (2004, 'jeudi', '18:00:00', '20:00:00', 2002),
(2005, 'vendredi', '17:00:00', '21:00:00', 2003), (2006, 'samedi', '10:00:00', '14:00:00', 2003);

-- 10. Cours (le cours 2008 n'a pas de coach : créé par le gestionnaire)
INSERT INTO courses (id, titre, description, niveau, capacite, prix, created_at, updated_at, salle_id, activite_id, coach_id) VALUES
(2001, 'Muscu débutant', 'Apprendre les mouvements de base en sécurité.', 'Débutant', 12, 15.00, NOW(), NOW(), 2001, 2001, 2001),
(2002, 'CrossFit WOD', 'Entraînement du jour en groupe, intensité élevée.', 'Avancé', 15, 18.00, NOW(), NOW(), 2001, 2004, 2001),
(2003, 'Hatha Yoga du soir', 'Séance relaxante pour finir la journée.', 'Tous niveaux', 20, 12.00, NOW(), NOW(), 2003, 2002, 2002),
(2004, 'Pilates renforcement', 'Gainage et posture sur tapis.', 'Intermédiaire', 15, 14.00, NOW(), NOW(), 2003, 2003, 2002),
(2005, 'Boxe initiation', 'Découvrir la boxe anglaise : garde, déplacements, frappes.', 'Débutant', 10, 16.00, NOW(), NOW(), 2002, 2005, 2003),
(2006, 'Cardio boxe', 'Enchaînements de frappes pour brûler des calories.', 'Intermédiaire', 2, 16.00, NOW(), NOW(), 2002, 2005, 2003),
(2007, 'Zumba party', 'Danse fitness dans la bonne humeur.', 'Tous niveaux', 25, 10.00, NOW(), NOW(), 2002, 2006, 2003),
(2008, 'Musculation libre', 'Accès encadré à la salle de musculation.', 'Tous niveaux', 30, 8.00, NOW(), NOW(), 2001, 2001, NULL);
-- Le cours 2006 a une capacité de 2 : sa séance 2011 est complète (pour tester le contrôle de capacité)

-- 11. Séances : passées (terminee) et à venir (ouverte / complete)
INSERT INTO seances (id, date_debut, date_fin, statut, cours_id) VALUES
(2001, '2026-10-12 09:00:00', '2026-10-12 10:00:00', 'terminee', 2001),
(2002, '2026-10-15 18:00:00', '2026-10-15 19:00:00', 'terminee', 2003),
(2003, '2026-10-17 18:00:00', '2026-10-17 19:00:00', 'terminee', 2005),
(2004, '2026-10-20 12:00:00', '2026-10-20 13:00:00', 'terminee', 2002),
(2005, '2026-11-02 09:00:00', '2026-11-02 10:00:00', 'ouverte', 2001),
(2006, '2026-11-04 09:00:00', '2026-11-04 10:00:00', 'ouverte', 2001),
(2007, '2026-11-03 12:00:00', '2026-11-03 13:00:00', 'ouverte', 2002),
(2008, '2026-11-05 18:00:00', '2026-11-05 19:00:00', 'ouverte', 2003),
(2009, '2026-11-06 10:00:00', '2026-11-06 11:00:00', 'ouverte', 2004),
(2010, '2026-11-06 18:00:00', '2026-11-06 19:00:00', 'ouverte', 2005),
(2011, '2026-11-07 17:00:00', '2026-11-07 18:00:00', 'complete', 2006),
(2012, '2026-11-07 19:00:00', '2026-11-07 20:00:00', 'ouverte', 2007),
(2013, '2026-11-09 14:00:00', '2026-11-09 16:00:00', 'ouverte', 2008),
(2014, '2026-11-12 18:00:00', '2026-11-12 19:00:00', 'ouverte', 2003);

-- 12. Réservations (sportifs vérifiés uniquement)
INSERT INTO reservations (id, numero, statut, created_at, updated_at, user_id, seance_id) VALUES
(2001, 'FB-2026-R0001', 'confirmee', '2026-10-10 10:00:00', '2026-10-10 10:00:00', 2007, 2001),
(2002, 'FB-2026-R0002', 'confirmee', '2026-10-11 11:00:00', '2026-10-11 11:00:00', 2008, 2002),
(2003, 'FB-2026-R0003', 'confirmee', '2026-10-14 09:30:00', '2026-10-14 09:30:00', 2009, 2003),
(2004, 'FB-2026-R0004', 'confirmee', '2026-10-18 15:00:00', '2026-10-18 15:00:00', 2007, 2004),
(2005, 'FB-2026-R0005', 'annulee', '2026-10-12 08:00:00', '2026-10-13 08:00:00', 2009, 2002),
(2006, 'FB-2026-R0006', 'confirmee', '2026-10-22 10:00:00', '2026-10-22 10:00:00', 2007, 2005),
(2007, 'FB-2026-R0007', 'confirmee', '2026-10-23 12:00:00', '2026-10-23 12:00:00', 2008, 2008),
(2008, 'FB-2026-R0008', 'confirmee', '2026-10-23 13:00:00', '2026-10-23 13:00:00', 2009, 2010),
(2009, 'FB-2026-R0009', 'confirmee', '2026-10-24 09:00:00', '2026-10-24 09:00:00', 2007, 2011),
(2010, 'FB-2026-R0010', 'confirmee', '2026-10-24 10:00:00', '2026-10-24 10:00:00', 2008, 2011),
(2011, 'FB-2026-R0011', 'confirmee', '2026-10-24 18:00:00', '2026-10-24 18:00:00', 2009, 2012);

-- 13. Avis (uniquement sur des séances terminées et des réservations confirmées)
INSERT INTO avis_notes (id, note, commentaire, statut, created_at, updated_at, reservation_id, salle_id, coach_id, cours_id) VALUES
(2001, 5, 'Coach très pédagogue, parfait pour débuter.', 'publie', '2026-10-12 12:00:00', '2026-10-12 12:00:00', 2001, NULL, 2001, NULL),
(2002, 4, 'Très bonne séance de yoga, salle calme et agréable.', 'publie', '2026-10-16 09:00:00', '2026-10-16 09:00:00', 2002, NULL, NULL, 2003),
(2003, 5, 'Salle propre et bien équipée, ring impeccable.', 'publie', '2026-10-18 10:00:00', '2026-10-18 10:00:00', 2003, 2002, NULL, NULL),
(2004, 3, 'Séance intense mais un peu trop de monde.', 'publie', '2026-10-20 18:00:00', '2026-10-20 18:00:00', 2004, NULL, NULL, 2002);

-- 14. Favoris
INSERT INTO favori_salle (user_id, salle_id) VALUES (2007, 2001), (2008, 2003), (2009, 2002);
INSERT INTO favori_cours (user_id, cours_id) VALUES (2007, 2002), (2008, 2003), (2008, 2004), (2010, 2007);
INSERT INTO favori_coach (user_id, coach_id) VALUES (2007, 2001), (2008, 2002), (2009, 2003);
