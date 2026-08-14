const express = require('express');
const router = express.Router();
const { getSales, createSale, deleteSale } = require('../controllers/saleController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getSales);
router.post('/', createSale);
router.delete('/:id', deleteSale);

module.exports = router;
