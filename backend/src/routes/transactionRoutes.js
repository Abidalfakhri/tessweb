const router = require('express').Router();
const controller = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, controller.list);
router.get('/:id', authMiddleware, controller.get);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.remove);

module.exports = router;
