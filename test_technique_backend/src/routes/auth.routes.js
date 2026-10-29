const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const auth = require('../middlewares/auth');

// Route publique
router.post('/login', authController.login);

// Route protégée : il faut un token valide
router.get('/me', auth, authController.me);

module.exports = router;