const router = require('express').Router();
const controller = require('../controllers/patient.controller');
const auth = require('../middlewares/auth');
const requireRole = require('../middlewares/role');
const appointmentController = require('../controllers/appointment.controller');

// Toutes les routes patients exigent un utilisateur connecté
router.use(auth);

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.get('/:id/appointments', appointmentController.listByPatient);
// Seul l'admin peut supprimer
router.delete('/:id', requireRole('admin'), controller.remove);

module.exports = router;