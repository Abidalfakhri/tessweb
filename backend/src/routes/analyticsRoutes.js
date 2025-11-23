const router = require('express').Router();
const controller = require('../controllers/analyticsController');

router.get('/summary', controller.summary);
router.get('/cashflow', controller.cashflow);
router.get('/category-summary', controller.categorySummary);
router.get('/financial-position', controller.financialPosition);
router.get('/compare', controller.compare);
router.get('/radar', controller.radar);

module.exports = router;
