const express = require('express');
const cors = require('cors');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Autorise les requêtes venant du frontend (autre port)
app.use(cors());

// Permet de lire le JSON envoyé dans le corps des requêtes
app.use(express.json());

// Route de test pour vérifier que le serveur répond
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Doivent rester en DERNIER : route inconnue (404), puis gestion centrale des erreurs
app.use(notFound);
app.use(errorHandler);

module.exports = app;