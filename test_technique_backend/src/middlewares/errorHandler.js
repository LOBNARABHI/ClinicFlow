const { ZodError } = require('zod');

// Middleware central : TOUTES les erreurs de l'application passent par ici
module.exports = (err, req, res, next) => {
  // Erreur de validation Zod : 400 avec le détail des champs invalides
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Données invalides',
      errors: err.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
    });
  }

  // Erreur volontaire de notre code (AppError) : on renvoie son code et son message
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Token JWT invalide ou expiré : 401
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }

  // Erreurs PostgreSQL les plus courantes, traduites en messages clairs
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Cette valeur existe déjà (doublon)' });
  }
  if (err.code === '23P01') {
    return res.status(409).json({ message: 'Ce patient a déjà un rendez-vous confirmé dans une fenêtre de 30 minutes' });
  }
  if (err.code === '22P02') {
    return res.status(400).json({ message: 'Identifiant invalide' });
  }

  // Toute autre erreur : 500, sans exposer les détails au client
  console.error(err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
};