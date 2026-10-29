const router = require('express').Router();
const controller = require('../controllers/appointment.controller');
const auth = require('../middlewares/auth');

router.use(auth);

router.post('/', controller.create);
router.get('/', controller.list);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;