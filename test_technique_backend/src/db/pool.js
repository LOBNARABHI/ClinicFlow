// Charge le fichier .env et met ses variables dans process.env
require('dotenv').config();
//le pilote PostgreSQL pour Node.js
const { Pool } = require('pg');

// Crée un "pool" de connexions à PostgreSQL.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Exporte le pool pour les autres fichiers (check.js, seed.js, services...)
module.exports = pool;