

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

-- 2. Utilisateurs (gestionnaires de salle, coachs, sportifs)
INSERT INTO users (id, email, roles, password, firstname, lastname, phone, accent_color, is_active, created_at, updated_at, is_verified, image_name, image_size) VALUES
(2001, 'sophie.martin@fitbook.be', '["ROLE_SALLE"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Sophie', 'Martin', '0470 11 22 33', 'orange', 1, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 1, NULL, NULL),
(2002, 'karim.benali@fitbook.be', '["ROLE_SALLE"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Karim', 'Benali', '0471 22 33 44', 'vert', 1, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 1, NULL, NULL),
(2003, 'pieter.claes@fitbook.be', '["ROLE_SALLE"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Pieter', 'Claes', '0472 33 44 55', 'vert', 1, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 1, NULL, NULL),
(2004, 'lucas.dubois@fitbook.be', '["ROLE_COACH"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Lucas', 'Dubois', '0473 44 55 66', 'rouge', 1, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 1, NULL, NULL),
(2005, 'amina.elidrissi@fitbook.be', '["ROLE_COACH"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Amina', 'El Idrissi', '0474 55 66 77', 'rose', 1, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 1, NULL, NULL),
(2006, 'thomas.peeters@fitbook.be', '["ROLE_COACH"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Thomas', 'Peeters', '0475 66 77 88', 'jaune', 1, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 1, NULL, NULL),
(2007, 'emma.janssens@gmail.com', '[]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Emma', 'Janssens', '0476 77 88 99', 'rose', 1, '2026-10-25 17:35:13', '2026-10-31 22:00:54', 1, 'il-1080xn-4480944190-9n3l-6ae609673a590675190953.webp', 71096),
(2008, 'nora.haddad@gmail.com', '[]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Nora', 'Haddad', NULL, 'vert', 1, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 1, NULL, NULL),
(2009, 'julien.lambert@gmail.com', '[]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Julien', 'Lambert', '0477 88 99 00', 'vert', 1, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 1, NULL, NULL),
(2010, 'lea.willems@gmail.com', '[]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Léa', 'Willems', NULL, 'rouge', 1, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 1, NULL, NULL),
(2011, 'yassine.moreau@gmail.com', '[]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Yassine', 'Moreau', '0478 99 00 11', 'rose', 1, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 0, NULL, NULL),
(2013, 'mary@fitbook.be', '[]', '$2y$13$6DGfQgXuo.ujW2i4ULr03us14Fg2n6b.H0HAVsJ4vyopwLyhjM1Ea', 'Mary', 'Omri', NULL, 'rose', 1, '2026-10-28 21:20:13', '2026-11-01 16:14:23', 1, '222731379-6ae76258adbbd513464650.png', 186311),
(2021, 'mike@fitbook.be', '["ROLE_SALLE"]', '$2y$13$I3BfYuGc5j7NXuO5JvyGHuNOz/hALeXZxvhi8a8j8iahrCp7H9bJy', 'Mike', 'Laurent', '0476 77 88 99', 'jaune', 1, '2026-10-31 17:19:28', '2026-10-31 17:24:54', 1, '516e838653661d2224da94324a7e1225-w200-6ae6245b67419650878407.webp', 49286),
(2022, 'vitor@fitbook.be', '["ROLE_COACH"]', '$2y$13$WcR0nSO3eIG3fyDcypFEmOvFFHZDSu3XAEGnE2sFUzZ/iJrlsM3Ki', 'Vitor', 'Santos', '+32 35 54 76', 'bleu', 1, '2026-10-31 20:29:05', '2026-10-31 22:02:30', 1, 'profilo-supereroe-coach-6ae65699438b4793450291.png', 1558871);

-- 3. Cartes de membre
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

-- 5. Salles
INSERT INTO salles (id, nom, adresse, code_postal, ville, description, telephone, capacite, equipements, latitude, longitude, created_at, updated_at, gestionnaire_id, image_name, image_size) VALUES
(2001, 'FitBook Bruxelles Centre', 'Boulevard Anspach 45', '1000', 'Bruxelles', 'Grande salle moderne au cœur de Bruxelles.', '02 511 22 33', 80, 'Machines cardio, poids libres, vestiaires, douches', 50.8476000, 4.3499000, '2026-10-25 17:35:13', '2026-10-31 20:14:16', 2001, 'aalo-lens-uynhrrm63uo-unsplash-6ae64c189c283829886800.jpg', 1883487),
(2002, 'FitBook Liège Guillemins', 'Rue des Guillemins 12', '4000', 'Liège', 'Salle lumineuse à deux pas de la gare.', '04 222 33 44', 60, 'Ring de boxe, tapis, vestiaires', 50.6243000, 5.5668000, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 2002, 'salle-2002.jpg', NULL),
(2003, 'FitBook Anvers Zuid', 'Leopold de Waelplaats 8', '2000', 'Anvers', 'Studio spécialisé yoga, pilates et danse.', '03 233 44 55', 40, 'Tapis de yoga, miroirs, sono', 51.2085000, 4.3920000, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 2003, 'salle-2003.jpg', NULL),
(2010, 'Osseghem salle', 'Rue Osseghem 53', '1203', 'Bruxelles', 'Salle de quartier à Osseghem : plateau musculation, espace cardio et grand parking.', '02 410 53 41', 200, 'Parking, poids libres, machines cardio, vestiaires', 50.8570328, 4.3252212, '2026-10-31 19:36:50', '2026-10-31 19:50:26', 2021, 'salle-nature-6ae643537d2dd896098403.jpg', 325031);

-- 6. Horaires d'ouverture
INSERT INTO horaires (id, jour, heure_ouverture, heure_fermeture, salle_id) VALUES
(2001, 'lundi', '07:00:00', '22:00:00', 2001),
(2002, 'mardi', '07:00:00', '22:00:00', 2001),
(2003, 'mercredi', '07:00:00', '22:00:00', 2001),
(2004, 'jeudi', '07:00:00', '22:00:00', 2001),
(2005, 'vendredi', '07:00:00', '21:00:00', 2001),
(2006, 'samedi', '09:00:00', '18:00:00', 2001),
(2007, 'lundi', '08:00:00', '21:00:00', 2002),
(2008, 'mardi', '08:00:00', '21:00:00', 2002),
(2009, 'mercredi', '08:00:00', '21:00:00', 2002),
(2010, 'jeudi', '08:00:00', '21:00:00', 2002),
(2011, 'vendredi', '08:00:00', '20:00:00', 2002),
(2012, 'samedi', '10:00:00', '16:00:00', 2002),
(2013, 'lundi', '09:00:00', '20:00:00', 2003),
(2014, 'mardi', '09:00:00', '20:00:00', 2003),
(2015, 'mercredi', '09:00:00', '20:00:00', 2003),
(2016, 'jeudi', '09:00:00', '20:00:00', 2003),
(2017, 'vendredi', '09:00:00', '19:00:00', 2003),
(2018, 'samedi', '10:00:00', '14:00:00', 2003);

-- 7. Profils coach
INSERT INTO coaches (id, biographie, annees_experience, tarif, certifications, langues, user_id, image_name, image_size, updated_at) VALUES
(2001, 'Coach en musculation et CrossFit, ancien athlète de haut niveau.', 8, 45.00, 'BPJEPS AF, CrossFit Level 2', 'Français, Anglais', 2004, 'coach-2001.jpg', NULL, NULL),
(2002, 'Professeure de yoga et pilates, passionnée par le bien-être.', 6, 40.00, 'RYT 500 Yoga Alliance', 'Français, Arabe, Anglais', 2005, 'coach-2002.jpg', NULL, NULL),
(2003, 'Coach de boxe et de cardio, ancien boxeur amateur.', 10, 50.00, NULL, 'Néerlandais, Français', 2006, 'coach-2003.jpg', NULL, NULL),
(2004, 'Coach polyvalent : renforcement musculaire, préparation physique et remise en forme.', 10, 56.00, 'BPJEPS AGFF, Préparateur physique', 'Portugais, Anglais, Français', 2022, 'supereroe-coach-rettangolare-6ae65877d5cd8431299704.png', 1545704, '2026-10-31 21:07:03');

-- 8. Activités enseignées (ManyToMany)
INSERT INTO enseigner (coach_id, activite_id) VALUES
(2001, 2001),
(2001, 2004),
(2002, 2002),
(2002, 2003),
(2003, 2005),
(2003, 2006);

-- 9. Disponibilités des coachs
INSERT INTO disponibilites_coaches (id, jour, heure_debut, heure_fin, coach_id) VALUES
(2001, 'lundi', '08:00:00', '12:00:00', 2001),
(2002, 'mercredi', '17:00:00', '21:00:00', 2001),
(2003, 'mardi', '09:00:00', '13:00:00', 2002),
(2004, 'jeudi', '18:00:00', '20:00:00', 2002),
(2005, 'vendredi', '17:00:00', '21:00:00', 2003),
(2006, 'samedi', '10:00:00', '14:00:00', 2003),
(2007, 'mardi', '09:00:00', '12:00:00', 2004);

-- 10. Cours (le cours 2006 a une capacité de 2 : sa séance 2011 est complète)
INSERT INTO courses (id, titre, description, niveau, capacite, prix, created_at, updated_at, salle_id, activite_id, coach_id) VALUES
(2001, 'Muscu débutant', 'Apprendre les mouvements de base en sécurité.', 'Débutant', 12, 15.00, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 2001, 2001, 2001),
(2002, 'CrossFit WOD', 'Entraînement du jour en groupe, intensité élevée.', 'Avancé', 15, 18.00, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 2001, 2004, 2001),
(2003, 'Hatha Yoga du soir', 'Séance relaxante pour finir la journée.', 'Tous niveaux', 20, 12.00, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 2003, 2002, 2002),
(2004, 'Pilates renforcement', 'Gainage et posture sur tapis.', 'Intermédiaire', 15, 14.00, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 2003, 2003, 2002),
(2005, 'Boxe initiation', 'Découvrir la boxe anglaise : garde, déplacements, frappes.', 'Débutant', 10, 16.00, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 2002, 2005, 2003),
(2006, 'Cardio boxe', 'Enchaînements de frappes pour brûler des calories.', 'Intermédiaire', 2, 16.00, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 2002, 2005, 2003),
(2007, 'Zumba party', 'Danse fitness dans la bonne humeur.', 'Tous niveaux', 25, 10.00, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 2002, 2006, 2003),
(2008, 'Musculation libre', 'Accès encadré à la salle de musculation.', 'Tous niveaux', 30, 8.00, '2026-10-25 17:35:13', '2026-10-25 17:35:13', 2001, 2001, NULL),
(2015, 'Musculation pro', 'Programme de musculation avancé : charges lourdes, techniques de progression et suivi personnalisé.', 'Avancé', 30, 23.00, '2026-10-31 19:42:34', '2026-10-31 19:42:34', 2010, 2001, 2003);

-- 11. Séances : passées (terminee) et à venir (dates calculées depuis aujourd'hui)
INSERT INTO seances (id, date_debut, date_fin, statut, cours_id) VALUES
(2001, '2026-10-12 09:00:00', '2026-10-12 10:00:00', 'terminee', 2001),
(2002, '2026-10-15 18:00:00', '2026-10-15 19:00:00', 'terminee', 2003),
(2003, '2026-10-17 18:00:00', '2026-10-17 19:00:00', 'terminee', 2005),
(2004, '2026-10-20 12:00:00', '2026-10-20 13:00:00', 'terminee', 2002),
(2005, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'), 'ouverte', 2001),
(2006, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '09:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00'), 'ouverte', 2001),
(2007, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '12:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '13:00:00'), 'ouverte', 2002),
(2008, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '18:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 4 DAY), '19:00:00'), 'ouverte', 2003),
(2009, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '10:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '11:00:00'), 'ouverte', 2004),
(2010, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '18:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 5 DAY), '19:00:00'), 'ouverte', 2005),
(2011, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '17:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '18:00:00'), 'complete', 2006),
(2012, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '19:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 6 DAY), '20:00:00'), 'ouverte', 2007),
(2013, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 8 DAY), '14:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 8 DAY), '16:00:00'), 'ouverte', 2008),
(2014, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 11 DAY), '18:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 11 DAY), '19:00:00'), 'ouverte', 2003);

-- 12. Réservations (la séance 2011 a 2 réservations confirmées = complète)
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
(2011, 'FB-2026-R0011', 'confirmee', '2026-10-24 18:00:00', '2026-10-24 18:00:00', 2009, 2012),
(2014, 'FB-2026-6A5666', 'confirmee', '2026-11-01 16:28:07', '2026-11-01 16:28:07', 2013, 2007),
(2015, 'FB-2026-60A2EB', 'confirmee', '2026-11-01 18:09:44', '2026-11-01 18:09:44', 2013, 2005);

-- 13. Avis (sur des séances terminées)
INSERT INTO avis_notes (id, note, commentaire, statut, created_at, updated_at, reservation_id, salle_id, coach_id, cours_id) VALUES
(2001, 5, 'Coach très pédagogue, parfait pour débuter.', 'publie', '2026-10-12 12:00:00', '2026-10-12 12:00:00', 2001, NULL, 2001, NULL),
(2002, 4, 'Très bonne séance de yoga, salle calme et agréable.', 'publie', '2026-10-16 09:00:00', '2026-10-16 09:00:00', 2002, NULL, NULL, 2003),
(2003, 5, 'Salle propre et bien équipée, ring impeccable.', 'publie', '2026-10-18 10:00:00', '2026-10-18 10:00:00', 2003, 2002, NULL, NULL),
(2004, 3, 'Séance intense mais un peu trop de monde.', 'publie', '2026-10-20 18:00:00', '2026-10-20 18:00:00', 2004, NULL, NULL, 2002);

-- 14. Favoris
INSERT INTO favori_salle (user_id, salle_id) VALUES
(2007, 2001),
(2008, 2003),
(2009, 2002),
(2013, 2001),
(2013, 2010);

INSERT INTO favori_cours (user_id, cours_id) VALUES
(2007, 2002),
(2008, 2003),
(2008, 2004),
(2010, 2007),
(2013, 2001);

INSERT INTO favori_coach (user_id, coach_id) VALUES
(2007, 2001),
(2008, 2002),
(2009, 2003),
(2013, 2001),
(2013, 2003),
(2022, 2004);
