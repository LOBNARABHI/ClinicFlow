const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const AppError = require('../utils/AppError');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

// Vérifie email + mot de passe et retourne un token JWT avec les infos de l'utilisateur
async function login(email, password) {
  // Cherche l'utilisateur par email (en minuscules)
  const { rows } = await pool.query(
    'SELECT id, full_name, email, password_hash, role FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  const user = rows[0];

  // Compare le mot de passe saisi avec le hash stocké en base
  const valid = user && (await bcrypt.compare(password, user.password_hash));

  // Même message dans les deux cas : on ne révèle pas si l'email existe
  if (!valid) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  // Crée le token : il contient l'id et le rôle, signé avec JWT_SECRET
  const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  return {
    token,
    user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role },
  };
}

// Retourne l'utilisateur connecté à partir de son id (sans le hash du mot de passe)
async function getMe(userId) {
  const { rows } = await pool.query(
    'SELECT id, full_name, email, role, created_at FROM users WHERE id = $1',
    [userId]
  );
  if (!rows[0]) {
    throw new AppError('Utilisateur introuvable', 404);
  }
  const u = rows[0];
  return { id: u.id, fullName: u.full_name, email: u.email, role: u.role, createdAt: u.created_at };
}

module.exports = { login, getMe };