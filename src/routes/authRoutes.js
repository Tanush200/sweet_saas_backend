const express = require('express');
const router = express.Router();
const { login, registerTenantShop, updateLanguage, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/register-shop', registerTenantShop);
router.put('/language', protect, updateLanguage);
router.get('/me', protect, getMe);

module.exports = router;
