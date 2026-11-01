-- 3 Procédures stockées 
-- mysql -u julien -p fitbook_db < sql/procedures.sql
-- Pour modifier une procédure : on la supprime (DROP) puis on la recrée

-- 1) Procédure sans paramètre : les séances à venir
DROP PROCEDURE IF EXISTS getProchainesSeances;
DELIMITER $$
CREATE PROCEDURE getProchainesSeances()
    BEGIN
        SELECT seances.id, courses.titre, seances.date_debut, seances.date_fin
        FROM seances
        JOIN courses ON courses.id = seances.cours_id
        WHERE seances.date_debut > NOW()
        ORDER BY seances.date_debut;
    END $$
DELIMITER ;

-- 2) Procédure avec paramètre d'entrée (IN) : places restantes d'une séance
DROP PROCEDURE IF EXISTS getPlacesRestantes;
DELIMITER $$
CREATE PROCEDURE getPlacesRestantes(IN idSeance INT)
    BEGIN
        SELECT courses.capacite - COUNT(reservations.id) AS places_restantes
        FROM seances
        JOIN courses ON courses.id = seances.cours_id
        LEFT JOIN reservations ON reservations.seance_id = seances.id AND reservations.statut = 'confirmee'
        WHERE seances.id = idSeance
        GROUP BY courses.capacite;
    END $$
DELIMITER ;

-- 3) Procédure avec paramètre d'entrée (IN) et de sortie (OUT) : note moyenne d'une salle
DROP PROCEDURE IF EXISTS getNoteMoyenneSalle;
DELIMITER $$
CREATE PROCEDURE getNoteMoyenneSalle(IN idSalle INT, OUT moyenne DECIMAL(3,1))
    BEGIN
        -- seulement les avis validés par l'admin (statut publie)
        SELECT AVG(note) INTO moyenne
        FROM avis_notes
        WHERE salle_id = idSalle AND statut = 'publie';
    END $$
DELIMITER ;

-- Exemples d'appel
-- sans paramètre : les séances à venir
-- CALL getProchainesSeances();

-- avec paramètre d'entrée : places restantes d'une séance
-- CALL getPlacesRestantes(2011);

-- avec paramètre d'entrée et de sortie : note moyenne d'une salle
-- CALL getNoteMoyenneSalle(2002, @moyenne);
-- SELECT @moyenne;
