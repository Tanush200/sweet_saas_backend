const express = require('express');
const router = express.Router();
const { getBatches, createBatch, deleteBatch, applyDiscount, markWasted } = require('../controllers/batchController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBatches);
router.post('/', createBatch);
router.delete('/:id', deleteBatch);
router.put('/:id/discount', applyDiscount);
router.post('/:id/waste', markWasted);

module.exports = router;
