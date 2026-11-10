const router = require('express').Router();
const c = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', c.list);
router.get('/categories', c.categories);
router.get('/:id', c.getOne);

router.post('/', protect, restrictTo('admin'), c.create);
router.put('/:id', protect, restrictTo('admin'), c.update);
router.delete('/:id', protect, restrictTo('admin'), c.remove);

module.exports = router;
