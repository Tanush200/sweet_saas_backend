const express = require('express');
const router = express.Router();
const {
  getSupplierPurchases,
  createSupplierPurchase,
  updateSupplierPurchase,
  recordSupplierPayment,
  deleteSupplierPurchase
} = require('../controllers/supplierPurchaseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getSupplierPurchases);
router.post('/', createSupplierPurchase);
router.put('/:id', updateSupplierPurchase);
router.put('/:id/pay', recordSupplierPayment);
router.delete('/:id', deleteSupplierPurchase);

module.exports = router;
