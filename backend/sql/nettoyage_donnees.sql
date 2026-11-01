-- Nettoyage des données avant la démonstration
-- Corrige les doublons, les incohérences et les données de test saisies à la main.
-- Lancement : mysql -u julien -p fitbook_db < sql/nettoyage_donnees.sql
-- Faire un backup avant : mysqldump -u julien -p fitbook_db > sql/backups/avant_nettoyage.sql

SET NAMES utf8mb4;
START TRANSACTION;

-- 1) Cours créé deux fois (double clic sur « Enregistrer ») : on garde 2015, on supprime 2016
--    (aucune séance, aucun avis et aucun favori ne pointe vers 2016)
DELETE FROM favori_cours WHERE cours_id = 2016;
DELETE FROM courses WHERE id = 2016;

-- 2) Séance 2011 marquée « complete » alors qu'il reste 1 place sur 2 : elle redevient ouverte
UPDATE seances SET statut = 'ouverte' WHERE id = 2011;

-- 3) Séances déjà passées encore « ouverte » : elles deviennent « terminee »
UPDATE seances SET statut = 'terminee' WHERE date_fin < NOW() AND statut = 'ouverte';

-- 4) Données saisies pendant les tests : on les rend présentables
UPDATE salles
SET ville = 'Bruxelles',
    telephone = '02 410 53 41',
    description = 'Salle de quartier à Osseghem : plateau musculation, espace cardio et grand parking.',
    equipements = 'Parking, poids libres, machines cardio, vestiaires'
WHERE id = 2010;

UPDATE salles
SET latitude = 50.8274000,
    longitude = 4.3720000,
    equipements = 'Machines cardio, poids libres, studio de cours collectifs'
WHERE id = 2009;

UPDATE courses
SET description = 'Programme de musculation avancé : charges lourdes, techniques de progression et suivi personnalisé.'
WHERE id = 2015;

UPDATE coaches
SET biographie = 'Coach polyvalent : renforcement musculaire, préparation physique et remise en forme.',
    certifications = 'BPJEPS AGFF, Préparateur physique'
WHERE id = 2004;

UPDATE users SET firstname = 'Mary', lastname = 'Lemaire' WHERE id = 2013;
UPDATE users SET firstname = 'Mike', lastname = 'Laurent' WHERE id = 2021;
UPDATE users SET lastname = 'Santos' WHERE id = 2022;

-- 5) Chaque gestionnaire de démo a au moins une salle : Sophie retrouve FitBook Bruxelles Centre
UPDATE salles SET gestionnaire_id = 2001 WHERE id = 2001;

COMMIT;

-- Vérifications
SELECT id, titre FROM courses WHERE titre = 'Musculation pro';
SELECT id, statut, date_debut FROM seances ORDER BY date_debut;
SELECT u.id, u.firstname, u.lastname, COUNT(s.id) AS nb_salles
FROM users u LEFT JOIN salles s ON s.gestionnaire_id = u.id
WHERE JSON_CONTAINS(u.roles, '"ROLE_SALLE"')
GROUP BY u.id;
