const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Sweet = require('../models/Sweet');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// Helper function to generate test user token
const generateTestUserToken = async (role = 'user') => {
    const user = await User.create({
        username: 'testuser_' + Date.now() + Math.random(),
        email: 'test_' + Date.now() + Math.random() + '@example.com',
        password: 'password123',
        role: role
    });
    // Sign token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return token;
};

beforeAll(async () => {
    // Connect to a test database
    // Use a distinct database name for testing to avoid wiping dev data
    const mongoUri = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/kada_test_db';
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

// Clear collections between tests to ensure isolation
afterEach(async () => {
    await Sweet.deleteMany({});
    await User.deleteMany({});
});

describe('POST /api/sweets/:id/purchase', () => {
    it('should decrease quantity when purchased', async () => {
        // 1. Arrange: Create a sweet with 10 items
        const sweet = await Sweet.create({ name: 'Fudge', category: 'Choco', price: 5, quantity: 10 });
        const userToken = await generateTestUserToken();

        // 2. Act: Make API call
        const res = await request(app)
            .post(`/api/sweets/${sweet._id}/purchase`)
            .set('Authorization', `Bearer ${userToken}`);

        // 3. Assert: Check status and database state
        expect(res.statusCode).toEqual(200);
        const updatedSweet = await Sweet.findById(sweet._id);
        expect(updatedSweet.quantity).toEqual(9);
    });

    it('should return 400 if out of stock', async () => {
        const sweet = await Sweet.create({ name: 'Empty', category: 'Choco', price: 5, quantity: 0 });
        const userToken = await generateTestUserToken();

        const res = await request(app)
            .post(`/api/sweets/${sweet._id}/purchase`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('Out of stock');
    });
});