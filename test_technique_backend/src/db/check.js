const pool = require('./pool');

(async () => {
  try {

    // Envoie une requête SQL à la base pour tester la connexion
    const { rows } = await pool.query('SELECT now() AS time');
    console.log('Connexion OK :', rows[0].time);

    // Récupère la liste des tables existantes dans la base
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    // Affiche les noms des tables
    console.log('Tables :', tables.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Erreur :', err.message);
  } finally {
    await pool.end();
  }
})();