-- Remise à zéro des données de test Postman/Newman (à lancer avant chaque newman run)
-- Ordre important à cause des clés étrangères : enfants d'abord, parents ensuite.
-- Lancement : mysql -u julien -p fitbook_db < sql/reset_donnees_test.sql

DELETE FROM seances;
DELETE FROM courses;
DELETE FROM horaires;
DELETE FROM salles;
DELETE FROM activites;
DELETE FROM users WHERE email IN ('admin@fitbook.be', 'coach@fitbook.be');

-- Admin créé directement en base (on ne peut plus devenir admin via l'API)
INSERT INTO users (id, email, roles, password, firstname, lastname, accent_color, is_active, is_verified, created_at, updated_at)
VALUES (1000, 'admin@fitbook.be', '["ROLE_ADMIN"]', '$2y$13$Quq/E0TRvWe4d3jDsk217OpYaUi8FqqgFXR/DLz9AAJTEVMzLZ7WG', 'Julien', 'Admin', '#FF6B00', 1, 1, NOW(), NOW());