const { z } = require('zod');

// Schéma de validation des données du login
const loginSchema = z.object({
  // Doit être un email valide
  email: z.string().email('Email invalide'),
  // Mot de passe obligatoire (non vide)
  password: z.string().min(1, 'Mot de passe requis'),
});

module.exports = { loginSchema };