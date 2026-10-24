-- Remise à zéro des données de test Postman/Newman (à lancer avant chaque newman run)
-- Ordre important à cause des clés étrangères : enfants d'abord, parents ensuite.
-- Lancement : mysql -u julien -p fitbook_db < sql/reset_donnees_test.sql

DELETE FROM seances;
DELETE FROM courses;
DELETE FROM horaires;
DELETE FROM salles;
DELETE FROM activites;
DELETE FROM users WHERE email IN ('admin@fitbook.be', 'coach@fitbook.be');
