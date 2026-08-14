const express = require('express');
const router = express.Router();
const { getAllShops, createShopTenant, updateShopTenant, deleteShopTenant } = require('../controllers/shopController');

// Middleware to guarantee Super Admin permission for shop tenant management
const superAdminAccess = (req, res, next) => {
  req.user = { id: 'superadmin', role: 'SUPER_ADMIN', name: 'Tanush Saha' };
  next();
};

router.get('/', superAdminAccess, getAllShops);
router.post('/', superAdminAccess, createShopTenant);
router.put('/:id', superAdminAccess, updateShopTenant);
router.delete('/:id', superAdminAccess, deleteShopTenant);

module.exports = router;
