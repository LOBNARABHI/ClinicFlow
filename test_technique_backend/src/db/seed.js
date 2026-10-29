// Importe le pool de connexions et la librairie de hachage des mots de passe
const pool = require('./pool');
const bcrypt = require('bcrypt');

// Crée une date relative à aujourd'hui : dayOffset = décalage en jours, hour/minute = heure du RDV
// Ainsi, "Rendez-vous du jour" du dashboard affichera toujours des données
function slot(dayOffset, hour, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

(async () => {
  // On utilise un client unique pour faire tout le seed dans une transaction
  const client = await pool.connect();

  try {
    // Démarre la transaction : tout est validé ensemble, ou rien du tout
    await client.query('BEGIN');

    // Vide les 3 tables pour pouvoir relancer le seed sans doublons
    await client.query('TRUNCATE appointments, patients, users');

    // ---------- UTILISATEURS ----------
    // Hache les mots de passe avec bcrypt (10 = niveau de sécurité du hachage)
    const adminHash = await bcrypt.hash('Admin123!', 10);
    const staffHash = await bcrypt.hash('Staff123!', 10);

    // Insère 1 admin et 2 staff, et récupère leurs id générés (UUID)
    const usersData = [
      ['Admin Clinique', 'admin@clinicflow.com', adminHash, 'admin'],
      ['Lobna Rabhi', 'staff1@clinicflow.com', staffHash, 'staff'],
      ['Youssef Alami', 'staff2@clinicflow.com', staffHash, 'staff'],
    ];
    const users = [];
    for (const [fullName, email, hash, role] of usersData) {
      const { rows } = await client.query(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [fullName, email, hash, role]
      );
      users.push(rows[0].id);
    }

    // ---------- PATIENTS ----------
    // Insère 5 patients (CIN tous différents) et récupère leurs id
    const patientsData = [
      ['Ahmed El Idrissi', 'AB123456', '0612345678', '1985-03-12', 'Casablanca, Maarif'],
      ['Fatima Zahra Bennani', 'BK234567', '0623456789', '1992-07-25', 'Casablanca, Ain Sebaa'],
      ['Omar Tazi', 'CD345678', '0634567890', '1978-11-02', null],
      ['Khadija Mansouri', 'EF456789', '0645678901', '2000-01-18', 'Mohammedia'],
      ['Mehdi Chraibi', 'GH567890', '0656789012', '1965-09-30', 'Casablanca, Gauthier'],
    ];
    const patients = [];
    for (const [fullName, cin, phone, birthDate, address] of patientsData) {
      const { rows } = await client.query(
        'INSERT INTO patients (full_name, cin, phone, birth_date, address) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [fullName, cin, phone, birthDate, address]
      );
      patients.push(rows[0].id);
    }

    // ---------- RENDEZ-VOUS ----------
    // 10 RDV : mélange pending / confirmed / cancelled
    // Règle des 30 min respectée : un même patient n'a jamais 2 RDV confirmés rapprochés
    const appointmentsData = [
      [0, slot(0, 9, 0),   'confirmed', 'Consultation générale',  1],
      [0, slot(0, 11, 0),  'confirmed', 'Suivi tension',          1],
      [1, slot(0, 10, 0),  'pending',   'Douleurs abdominales',   2],
      [1, slot(1, 14, 0),  'confirmed', 'Contrôle analyses',      1],
      [2, slot(0, 15, 0),  'confirmed', 'Certificat médical',     2],
      [2, slot(2, 9, 30),  'pending',   'Vaccination',            1],
      [3, slot(-1, 11, 0), 'cancelled', 'Consultation dentaire',  2],
      [3, slot(1, 10, 0),  'pending',   'Maux de tête',           2],
      [4, slot(-2, 16, 0), 'confirmed', 'Bilan annuel',           1],
      [4, slot(3, 10, 30), 'cancelled', 'Renouvellement ordonnance', 2],
    ];
    for (const [patientIdx, date, status, reason, userIdx] of appointmentsData) {
      await client.query(
        'INSERT INTO appointments (patient_id, created_by, appointment_date, status, reason) VALUES ($1, $2, $3, $4, $5)',
        [patients[patientIdx], users[userIdx], date, status, reason]
      );
    }

    // Valide la transaction : toutes les données sont enregistrées
    await client.query('COMMIT');
    console.log('Seed terminé : 3 utilisateurs, 5 patients, 10 rendez-vous.');
  } catch (err) {
    // En cas d'erreur, annule tout ce qui a été fait dans la transaction
    await client.query('ROLLBACK');
    console.error('Erreur seed :', err.message);
  } finally {
    // Libère le client puis ferme le pool pour que le script se termine
    client.release();
    await pool.end();
  }
})();