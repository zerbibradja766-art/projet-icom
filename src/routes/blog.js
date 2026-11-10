const router = require('express').Router();
const c = require('../controllers/blogController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', c.list);
router.get('/admin/all', protect, restrictTo('admin'), c.listAll); // must be before /:slug
router.get('/:slug', c.getBySlug);

router.post('/', protect, restrictTo('admin'), c.create);
router.put('/:id', protect, restrictTo('admin'), c.update);
router.delete('/:id', protect, restrictTo('admin'), c.remove);

module.exports = router;
