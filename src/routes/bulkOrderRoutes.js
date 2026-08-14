const express = require('express');
const router = express.Router();
const { getBulkOrders, createBulkOrder, updateBulkOrder, updateOrderStatus, deleteBulkOrder } = require('../controllers/bulkOrderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBulkOrders);
router.post('/', createBulkOrder);
router.put('/:id', updateBulkOrder);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteBulkOrder);

module.exports = router;
