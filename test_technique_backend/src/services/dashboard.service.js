const pool = require('../db/pool');

// Retourne les 4 statistiques du dashboard
async function getStats() {
  const { rows } = await pool.query(`
    SELECT
      -- Total des patients non supprimés (soft delete)
      (SELECT COUNT(*)::int FROM patients WHERE deleted_at IS NULL) AS total_patients,

      -- Rendez-vous d'aujourd'hui : de minuit (inclus) à minuit du lendemain (exclu).
      -- Cette forme utilise l'index sur appointment_date.
      COUNT(*) FILTER (
        WHERE appointment_date >= date_trunc('day', now())
          AND appointment_date <  date_trunc('day', now()) + interval '1 day'
      )::int AS today_appointments,

      -- Nombre de rendez-vous par statut
      COUNT(*) FILTER (WHERE status = 'pending')::int   AS pending_count,
      COUNT(*) FILTER (WHERE status = 'confirmed')::int AS confirmed_count
    FROM appointments
  `);

  const r = rows[0];
  return {
    totalPatients: r.total_patients,
    todayAppointments: r.today_appointments,
    pendingCount: r.pending_count,
    confirmedCount: r.confirmed_count,
  };
}

module.exports = { getStats };