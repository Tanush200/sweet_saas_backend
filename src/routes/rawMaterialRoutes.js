const express = require('express');
const router = express.Router();
const {
  getRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  updateStock,
  deleteRawMaterial
} = require('../controllers/rawMaterialController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getRawMaterials);
router.post('/', createRawMaterial);
router.put('/:id', updateRawMaterial);
router.put('/:id/restock', updateStock);
router.delete('/:id', deleteRawMaterial);

module.exports = router;
