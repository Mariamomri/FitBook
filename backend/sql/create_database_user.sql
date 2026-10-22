seulement pour la consultation de prof le password sont en .env.local

-	Utiliser un utilisateur MySQL autre que « root » avec un mot de passe.
mysql -u root -p
CREATE USER 'julien'@'localhost' IDENTIFIED BY 'fitbook';
GRANT ALL PRIVILEGES ON fitbook_db.* TO 'julien'@'localhost';
FLUSH PRIVILEGES;
exit;

mysql -u julien -p
SELECT CURRENT_USER();
exit;

--------------------------------------------------------------------------------------------------------------
