const AppError = require('../utils/AppError');

// Appelé quand aucune route ne correspond à l'URL demandée : erreur 404
module.exports = (req, res, next) => {
  next(new AppError(`Route introuvable : ${req.method} ${req.originalUrl}`, 404));
};