const User = require('../models/User');
const Sweet = require('../models/Sweet');

// View List
const viewSweets = async (req, res) => {
    try {
        const sweets = await Sweet.find();
        res.json(sweets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// API to search specific sweets
const searchSweets = async (req, res) => {
    try {
        const { name, category, minPrice, maxPrice } = req.query;
        let query = {};

        if (name) query.name = { $regex: name, $options: 'i' }; // Partial match
        if (category) query.category = category;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const sweets = await Sweet.find(query);
        res.json(sweets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// API to add new sweets
const addSweets = async (req, res) => {
    try {
        const sweet = new Sweet(req.body);
        await sweet.save();
        res.status(201).json(sweet);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// API to update existing sweets
const updateSweets = async (req, res) => {
    try {
        const sweet = await Sweet.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
        res.json(sweet);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// API to delete existing sweets
const removeSweets = async (req, res) => {
    try {
        const sweet = await Sweet.findByIdAndDelete(req.params.id);
        if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
        res.json({ message: 'Sweet deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// API to purchase sweets
const purchaseSweets = async (req, res) => {
    try {
        const sweet = await Sweet.findById(req.params.id);
        if (!sweet) return res.status(404).json({ error: 'Sweet not found' });
        
        if (sweet.quantity < 1) {
            return res.status(400).json({ error: 'Out of stock' });
        }

        sweet.quantity -= 1;
        await sweet.save();
        res.json({ message: 'Purchase successful', currentStock: sweet.quantity });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// API to restock sweets
const restockSweets = async (req, res) => {
    try {
        const { amount } = req.body; // Expecting { amount: 10 }
        if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid restock amount' });

        const sweet = await Sweet.findById(req.params.id);
        if (!sweet) return res.status(404).json({ error: 'Sweet not found' });

        sweet.quantity += Number(amount);
        await sweet.save();
        res.json({ message: 'Restock successful', currentStock: sweet.quantity });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


module.exports = {
    viewSweets,
    searchSweets,
    addSweets,
    updateSweets,
    removeSweets,
    purchaseSweets,
    restockSweets
};