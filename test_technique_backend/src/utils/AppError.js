// Erreur personnalisée : porte un code HTTP (400, 401, 403, 404, 409...)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;