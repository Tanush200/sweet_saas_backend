const express = require('express');
const router = express.Router();
const { getItems, getPublicItems, createItem, updateItem, deleteItem } = require('../controllers/itemController');
const { protect } = require('../middleware/auth');

// PUBLIC ENDPOINTS (No login required)
router.get('/public', getPublicItems);

// PROTECTED ENDPOINTS (JWT Token required)
router.use(protect);

router.get('/', getItems);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
