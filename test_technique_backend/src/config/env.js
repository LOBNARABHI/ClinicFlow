// Charge le fichier .env
require('dotenv').config();

// Vérifie que les variables indispensables existent, sinon on arrête tout de suite
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET manquant dans le fichier .env');
}

// Regroupe les variables dans un seul objet réutilisable partout
module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '1d',
};