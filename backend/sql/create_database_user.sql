-- utiliser un utilisateur autre que « root » avec un mot de passe.
-- Le vrai mot de passe n'est pas dans ce fichier : il se trouve uniquement dans backend/.env.local .


CREATE USER 'julien'@'localhost' IDENTIFIED BY 'psw_est_sur.env.local';
GRANT ALL PRIVILEGES ON fitbook_db.* TO 'julien'@'localhost';
FLUSH PRIVILEGES;

-- mysql -u julien -p)
-- SELECT CURRENT_USER();
