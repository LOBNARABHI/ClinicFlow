const AppError = require('../utils/AppError');

// Autorise l'accès seulement aux rôles indiqués, sinon erreur 403
// Utilisation : requireRole('admin')
module.exports = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Accès refusé : droits insuffisants', 403));
  }
  next();
};