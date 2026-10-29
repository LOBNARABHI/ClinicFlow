// Enveloppe un controller async : toute erreur est envoyée au middleware d'erreurs
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};