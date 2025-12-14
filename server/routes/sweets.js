const express = require('express');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();
const { viewSweets, searchSweets, addSweets, updateSweets, removeSweets, purchaseSweets, restockSweets } = require('../controllers/sweet');

// GET /api/sweets - View List
router.get('/', authenticate, viewSweets);

// GET /api/sweets/search?name=x&category=y&minPrice=10
router.get('/search', authenticate, searchSweets);

// POST /api/sweets - Add Sweet
router.post('/', authenticate, isAdmin, addSweets);

// PUT /api/sweets/:id - Update Sweet
router.put('/:id', authenticate, isAdmin, updateSweets);

// DELETE /api/sweets/:id - Delete Sweet
router.delete('/:id', authenticate, isAdmin, removeSweets);

// POST /api/sweets/:id/purchase - Decrease Qty
router.post('/:id/purchase', authenticate, purchaseSweets);

// POST /api/sweets/:id/restock - Increase Qty (Admin Only)
router.post('/:id/restock', authenticate, isAdmin, restockSweets);

module.exports = router;
