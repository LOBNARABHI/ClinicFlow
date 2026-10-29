const router = require('express').Router();
const controller = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth');

// Accessible à tout utilisateur connecté (admin ou staff)
router.get('/stats', auth, controller.stats);

module.exports = router;