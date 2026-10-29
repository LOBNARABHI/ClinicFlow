const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { jwtSecret } = require('../config/env');

// Vérifie le token JWT envoyé dans l'en-tête Authorization
module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  // L'en-tête doit avoir la forme : "Bearer <token>"
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentification requise', 401));
  }

  const token = header.split(' ')[1];

  // verify lance une erreur si le token est invalide ou expiré (gérée par errorHandler : 401)
  const payload = jwt.verify(token, jwtSecret);

  // Stocke l'utilisateur dans la requête pour les middlewares et controllers suivants
  req.user = { id: payload.id, role: payload.role };
  next();
};