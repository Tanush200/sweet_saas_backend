const express = require('express');
const router = express.Router();
const { getCustomerByPhone, redeemReward } = require('../controllers/loyaltyController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/:phone', getCustomerByPhone);
router.post('/redeem', redeemReward);

module.exports = router;
