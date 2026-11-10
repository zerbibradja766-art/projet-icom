const router = require('express').Router();
const c = require('../controllers/contactController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/', c.send);

router.get('/', protect, restrictTo('admin'), c.list);
router.patch('/:id/read', protect, restrictTo('admin'), c.markRead);
router.delete('/:id', protect, restrictTo('admin'), c.remove);

module.exports = router;
