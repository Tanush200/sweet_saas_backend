const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.post('/image', protect, uploadImage);

module.exports = router;
