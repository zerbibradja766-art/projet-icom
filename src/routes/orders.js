const router = require('express').Router();
const c = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);

router.post('/', c.create);
router.get('/mine', c.mine);
router.get('/', restrictTo('admin'), c.listAll);
router.get('/:id', c.getOne);
router.patch('/:id/cancel', c.cancel);
router.patch('/:id/status', restrictTo('admin'), c.updateStatus);

module.exports = router;
