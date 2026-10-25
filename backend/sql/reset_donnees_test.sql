-- Remise à zéro des données de test Postman/Newman (à lancer avant chaque newman run)
-- Ordre important à cause des clés étrangères : enfants d'abord, parents ensuite.
-- On supprime uniquement ce que Newman crée : les données de démo (donnees_demo.sql) restent.
-- Lancement : mysql -u julien -p fitbook_db < sql/reset_donnees_test.sql

SET NAMES utf8mb4;

DELETE FROM seances WHERE cours_id IN (SELECT id FROM courses WHERE titre = 'Yoga du matin');
DELETE FROM courses WHERE titre = 'Yoga du matin';
DELETE FROM salles WHERE nom = 'FitBook Ixelles';
DELETE FROM activites WHERE nom = 'Yoga';
DELETE FROM users WHERE email IN ('admin@fitbook.be', 'coach@fitbook.be');

-- Admin créé directement en base (on ne peut plus devenir admin via l'API)
INSERT INTO users (id, email, roles, password, firstname, lastname, accent_color, is_active, is_verified, created_at, updated_at)
VALUES (1000, 'admin@fitbook.be', '["ROLE_ADMIN"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Julien', 'Admin', '#FF6B00', 1, 1, NOW(), NOW());
