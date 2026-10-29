const pool = require('../db/pool');
const AppError = require('../utils/AppError');

// Convertit une ligne SQL en objet JSON, avec le nom du patient
const toAppointment = (r) => ({
  id: r.id,
  patientId: r.patient_id,
  patientName: r.patient_name,
  patientCin: r.patient_cin,
  appointmentDate: r.appointment_date,
  status: r.status,
  reason: r.reason,
  notes: r.notes,
  createdBy: r.created_by,
  createdByName: r.created_by_name,
  createdAt: r.created_at,
});

// SELECT commun : jointure avec patients et users pour afficher les noms
const BASE_SELECT = `
  SELECT a.id, a.patient_id, a.appointment_date, a.status, a.reason, a.notes,
         a.created_by, a.created_at,
         p.full_name AS patient_name, p.cin AS patient_cin,
         u.full_name AS created_by_name
  FROM appointments a
  JOIN patients p ON p.id = a.patient_id
  JOIN users u ON u.id = a.created_by`;

// Règle métier : un patient ne peut pas avoir 2 RDV confirmés à moins de 30 minutes d'écart.
// excludeId permet d'ignorer le RDV lui-même lors d'un changement de statut.
async function assertNoConflict(client, patientId, date, excludeId = null) {
  const { rows } = await client.query(
    `SELECT id, appointment_date FROM appointments
     WHERE patient_id = $1
       AND status = 'confirmed'
       AND ($3::uuid IS NULL OR id <> $3::uuid)
       AND ABS(EXTRACT(EPOCH FROM (appointment_date - $2::timestamptz))) < 1800
     LIMIT 1`,
    [patientId, date, excludeId]
  );
  if (rows[0]) {
    throw new AppError(
      'Ce patient a déjà un rendez-vous confirmé dans une fenêtre de 30 minutes',
      409
    );
  }
}

// Vérifie que le patient existe et n'est pas supprimé
async function assertPatientExists(client, patientId) {
  const { rows } = await client.query(
    'SELECT id FROM patients WHERE id = $1 AND deleted_at IS NULL',
    [patientId]
  );
  if (!rows[0]) throw new AppError('Patient introuvable', 404);
}

// Crée un rendez-vous (createdBy = utilisateur connecté, jamais fourni par le client)
async function create(data, userId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await assertPatientExists(client, data.patientId);

    // La règle des 30 min ne concerne que les RDV confirmés
    if (data.status === 'confirmed') {
      await assertNoConflict(client, data.patientId, data.appointmentDate);
    }

    const { rows } = await client.query(
      `INSERT INTO appointments (patient_id, created_by, appointment_date, status, reason, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [data.patientId, userId, data.appointmentDate, data.status, data.reason, data.notes || null]
    );
    await client.query('COMMIT');
    return getById(rows[0].id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getById(id) {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE a.id = $1`, [id]);
  if (!rows[0]) throw new AppError('Rendez-vous introuvable', 404);
  return toAppointment(rows[0]);
}

// Liste filtrable par date (jour entier) et par statut
async function list({ date, status }) {
  const conditions = [];
  const params = [];

  if (date) {
    // Compare le jour de la date en heure locale du serveur
    params.push(date);
    conditions.push(`a.appointment_date::date = $${params.length}::date`);
  }
  if (status) {
    params.push(status);
    conditions.push(`a.status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `${BASE_SELECT} ${where} ORDER BY a.appointment_date ASC`,
    params
  );
  return rows.map(toAppointment);
}

// Liste des rendez-vous d'un patient (page "détails patient")
async function listByPatient(patientId) {
  const { rows } = await pool.query(
    `${BASE_SELECT} WHERE a.patient_id = $1 ORDER BY a.appointment_date DESC`,
    [patientId]
  );
  return rows.map(toAppointment);
}

// Change le statut ; si on passe à "confirmed", on revérifie la règle des 30 min
async function updateStatus(id, status) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // FOR UPDATE verrouille la ligne pendant la transaction
    const { rows } = await client.query(
      'SELECT patient_id, appointment_date FROM appointments WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (!rows[0]) throw new AppError('Rendez-vous introuvable', 404);

    if (status === 'confirmed') {
      await assertNoConflict(client, rows[0].patient_id, rows[0].appointment_date, id);
    }

    await client.query('UPDATE appointments SET status = $1 WHERE id = $2', [status, id]);
    await client.query('COMMIT');
    return getById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { create, list, listByPatient, getById, updateStatus };