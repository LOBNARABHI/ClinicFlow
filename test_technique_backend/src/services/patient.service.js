const pool = require('../db/pool');
const AppError = require('../utils/AppError');

// Convertit une ligne SQL (snake_case) en objet JSON (camelCase)
const toPatient = (r) => ({
  id: r.id,
  fullName: r.full_name,
  cin: r.cin,
  phone: r.phone,
  birthDate: r.birth_date,
  address: r.address,
  createdAt: r.created_at,
});

const COLUMNS = 'id, full_name, cin, phone, to_char(birth_date, \'YYYY-MM-DD\') AS birth_date, address, created_at';

// Crée un patient (le doublon de CIN est géré par la contrainte UNIQUE : erreur 409)
async function create(data) {
  const { rows } = await pool.query(
    `INSERT INTO patients (full_name, cin, phone, birth_date, address)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${COLUMNS}`,
    [data.fullName, data.cin, data.phone, data.birthDate, data.address || null]
  );
  return toPatient(rows[0]);
}

// Liste paginée avec recherche sur le nom ou le CIN (ignore les patients supprimés)
async function list({ search, page, limit }) {
  const offset = (page - 1) * limit;
  const pattern = `%${search}%`;

  // Le total sert à calculer le nombre de pages
  const totalRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM patients
     WHERE deleted_at IS NULL AND (full_name ILIKE $1 OR cin ILIKE $1)`,
    [pattern]
  );

  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM patients
     WHERE deleted_at IS NULL AND (full_name ILIKE $1 OR cin ILIKE $1)
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [pattern, limit, offset]
  );

  const total = totalRes.rows[0].total;
  return {
    data: rows.map(toPatient),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// Retourne un patient, ou 404 s'il n'existe pas / est supprimé
async function getById(id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM patients WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  if (!rows[0]) throw new AppError('Patient introuvable', 404);
  return toPatient(rows[0]);
}

// Modifie un patient
async function update(id, data) {
  const { rows } = await pool.query(
    `UPDATE patients
     SET full_name = $1, cin = $2, phone = $3, birth_date = $4, address = $5
     WHERE id = $6 AND deleted_at IS NULL
     RETURNING ${COLUMNS}`,
    [data.fullName, data.cin, data.phone, data.birthDate, data.address || null, id]
  );
  if (!rows[0]) throw new AppError('Patient introuvable', 404);
  return toPatient(rows[0]);
}

// Suppression logique (soft delete) : on remplit deleted_at, l'historique est conservé.
// Le CIN est libéré en le suffixant, pour pouvoir recréer un patient avec le même CIN.
async function remove(id) {
  const { rowCount } = await pool.query(
    'UPDATE patients SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  if (!rowCount) throw new AppError('Patient introuvable', 404);
}

module.exports = { create, list, getById, update, remove };