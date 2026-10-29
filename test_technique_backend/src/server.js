const { port } = require('./config/env');
const app = require('./app');

// Démarre le serveur sur le port défini dans le .env
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});