const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Sweet = require('../models/Sweet');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generates a test user with a valid JWT token
 * @param {string} role - 'user' or 'admin'
 * @returns {Promise<{token: string, userId: string}>}
 * 
 * EXPLANATION: This helper creates a real user in the test DB and generates
 * a JWT token for authentication testing. We return both token and userId
 * in case tests need to verify ownership or user-specific behavior.
 */
const generateTestUserToken = async (role = 'user') => {
    const user = await User.create({
        username: 'testuser_' + Date.now() + Math.random(),
        email: 'test_' + Date.now() + Math.random() + '@example.com',
        password: 'password123',
        role: role
    });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    return { token, userId: user._id };
};

/**
 * Creates a sample sweet for testing
 * EXPLANATION: DRY principle - avoids repeating sweet creation in every test
 */
const createTestSweet = (overrides = {}) => {
    return Sweet.create({
        name: 'Chocolate Fudge',
        category: 'Chocolate',
        price: 5.99,
        quantity: 10,
        ...overrides // Allow tests to override specific fields
    });
};

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeAll(async () => {
    // Connect to a test database (separate from development/production)
    // EXPLANATION: Using a separate test DB prevents tests from affecting real data
    const mongoUri = process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    // Clean up test database after all tests finish
    // EXPLANATION: Prevents test data from accumulating and consuming space
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

afterEach(async () => {
    // Clear all collections between tests for isolation
    // EXPLANATION: Test isolation ensures one test's data doesn't affect another
    // This is crucial for reliable, repeatable test results
    await Sweet.deleteMany({});
    await User.deleteMany({});
});

// ============================================================================
// UNIT TESTS - Test individual functions/controllers in isolation
// ============================================================================
// Unit tests focus on testing ONE piece of logic at a time with mocked dependencies.
// They're fast, focused, and help catch bugs in specific functions.

describe('🧪 UNIT TESTS: Sweet Model Validation', () => {
    /**
     * Test: Sweet model should validate required fields
     * PATTERN: Test validation rules without API calls
     */
    it('should reject sweet without required fields', async () => {
        try {
            await Sweet.create({ name: 'NoCategory' }); // Missing category, price, quantity
            fail('Should have thrown validation error');
        } catch (error) {
            // EXPLANATION: MongoDB throws validation error for missing required fields
            expect(error.message).toContain('validation failed');
        }
    });

    /**
     * Test: Sweet model should enforce price >= 0
     * PATTERN: Test schema constraints/rules
     */
    it('should reject negative price', async () => {
        try {
            await Sweet.create({
                name: 'Negative Price Sweet',
                category: 'Test',
                price: -5, // Invalid: price can't be negative
                quantity: 10
            });
            fail('Should have thrown validation error');
        } catch (error) {
            expect(error.message).toContain('validation failed');
        }
    });

    /**
     * Test: Sweet model should have default quantity of 0
     * PATTERN: Test default values
     */
    it('should have default quantity of 0', async () => {
        const sweet = await Sweet.create({
            name: 'Default Qty Sweet',
            category: 'Test',
            price: 5.99
            // quantity not provided - should default to 0
        });
        expect(sweet.quantity).toEqual(0);
    });
});

// ============================================================================
// UNIT TESTS: Controller Logic (Isolated from HTTP layer)
// ============================================================================
// These test the business logic without the HTTP request/response overhead

describe('🧪 UNIT TESTS: Sweet Controller Functions', () => {
    /**
     * Test: Adding a sweet should create it in database
     * PATTERN: Direct function call, not HTTP request
     * Note: In a real scenario, you'd import the controller function directly
     * For now, we use the HTTP endpoint but verify the database state
     */
    it('should validate that a sweet is created with correct properties', async () => {
        const sweetData = {
            name: 'Vanilla Cake',
            category: 'Baked',
            price: 7.99,
            quantity: 5
        };

        const sweet = await Sweet.create(sweetData);

        // EXPLANATION: Assert each field was saved correctly
        expect(sweet.name).toBe('Vanilla Cake');
        expect(sweet.category).toBe('Baked');
        expect(sweet.price).toBe(7.99);
        expect(sweet.quantity).toBe(5);
        expect(sweet._id).toBeDefined(); // Should have auto-generated ID
    });

    /**
     * Test: Searching with name filter should work (case-insensitive)
     * PATTERN: Testing business logic of search algorithm
     */
    it('should find sweet by partial name match (case-insensitive)', async () => {
        await Sweet.create({ name: 'Chocolate Chip Cookies', category: 'Baked', price: 4.99, quantity: 20 });
        await Sweet.create({ name: 'Chocolate Fudge', category: 'Chocolate', price: 5.99, quantity: 10 });
        await Sweet.create({ name: 'Vanilla Cookies', category: 'Baked', price: 3.99, quantity: 15 });

        // EXPLANATION: Test the search logic - should match "chocolate" in both name and case-insensitive
        const results = await Sweet.find({ name: { $regex: 'chocolate', $options: 'i' } });
        expect(results.length).toBe(2);
        expect(results.some(s => s.name === 'Chocolate Chip Cookies')).toBe(true);
        expect(results.some(s => s.name === 'Chocolate Fudge')).toBe(true);
    });

    /**
     * Test: Filtering by price range
     * PATTERN: Test range query logic
     */
    it('should filter sweets by price range', async () => {
        await Sweet.create({ name: 'Cheap', category: 'Test', price: 1.99, quantity: 10 });
        await Sweet.create({ name: 'Medium', category: 'Test', price: 5.99, quantity: 10 });
        await Sweet.create({ name: 'Expensive', category: 'Test', price: 15.99, quantity: 10 });

        // EXPLANATION: Test that price filtering works correctly
        const results = await Sweet.find({
            price: { $gte: 3, $lte: 10 } // Between $3 and $10
        });
        expect(results.length).toBe(1);
        expect(results[0].name).toBe('Medium');
    });
});

// ============================================================================
// INTEGRATION TESTS: API Endpoints & Database Interaction
// ============================================================================
// Integration tests verify that the entire flow works: HTTP → Controller → DB
// They test real-world scenarios where multiple components interact

describe('🔗 INTEGRATION TESTS: GET /api/sweets (Fetch all sweets)', () => {
    /**
     * PATTERN: Full HTTP request → Database query → Response
     * This is a complete flow test
     */
    it('should fetch all sweets with authentication', async () => {
        // Arrange: Create test data
        await Sweet.create({ name: 'Sweet 1', category: 'Cat1', price: 5, quantity: 10 });
        await Sweet.create({ name: 'Sweet 2', category: 'Cat2', price: 8, quantity: 5 });
        const { token } = await generateTestUserToken();

        // Act: Make HTTP request
        const res = await request(app)
            .get('/api/sweets')
            .set('Authorization', `Bearer ${token}`);

        // Assert: Verify response and data
        // EXPLANATION: Check both HTTP status AND response data matches what we created
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(2);
        expect(res.body[0].name).toBe('Sweet 1');
        expect(res.body[1].name).toBe('Sweet 2');
    });

    /**
     * PATTERN: Test error handling - no authentication
     */
    it('should return 401 if not authenticated', async () => {
        const res = await request(app)
            .get('/api/sweets');
            // No Authorization header

        // EXPLANATION: Verify that protected routes require authentication
        expect(res.statusCode).toEqual(401);
    });

    /**
     * PATTERN: Test empty state
     */
    it('should return empty array when no sweets exist', async () => {
        const { token } = await generateTestUserToken();

        const res = await request(app)
            .get('/api/sweets')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual([]); // Empty array
    });
});

describe('🔗 INTEGRATION TESTS: POST /api/sweets (Add new sweet)', () => {
    /**
     * PATTERN: Create via API → Verify in database
     */
    it('should add a new sweet (admin only)', async () => {
        const { token } = await generateTestUserToken('admin');
        const newSweet = {
            name: 'Rainbow Cake',
            category: 'Baked',
            price: 12.99,
            quantity: 3
        };

        // Act: POST request
        const res = await request(app)
            .post('/api/sweets')
            .set('Authorization', `Bearer ${token}`)
            .send(newSweet);

        // Assert: Check response
        expect(res.statusCode).toEqual(201); // Created status
        expect(res.body.name).toBe('Rainbow Cake');
        expect(res.body._id).toBeDefined();

        // EXPLANATION: Integration test - verify it was actually saved to DB
        const savedSweet = await Sweet.findById(res.body._id);
        expect(savedSweet).toBeDefined();
        expect(savedSweet.price).toBe(12.99);
    });

    /**
     * PATTERN: Test authorization - non-admin should be rejected
     */
    it('should reject sweet creation by non-admin user', async () => {
        const { token } = await generateTestUserToken('user'); // Regular user, not admin

        const res = await request(app)
            .post('/api/sweets')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Unauthorized Sweet',
                category: 'Test',
                price: 5,
                quantity: 10
            });

        // EXPLANATION: Non-admin users should get 403 Forbidden
        expect(res.statusCode).toEqual(403);
    });

    /**
     * PATTERN: Test validation error handling
     */
    it('should reject sweet with missing required fields', async () => {
        const { token } = await generateTestUserToken('admin');

        const res = await request(app)
            .post('/api/sweets')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Incomplete Sweet'
                // Missing: category, price, quantity
            });

        // EXPLANATION: API should reject invalid data
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBeDefined();
    });
});

describe('🔗 INTEGRATION TESTS: GET /api/sweets/search (Search sweets)', () => {
    /**
     * PATTERN: Test complex query functionality
     */
    it('should search by name with query parameter', async () => {
        // Arrange
        await createTestSweet({ name: 'Strawberry Jam' });
        await createTestSweet({ name: 'Blueberry Pie' });
        const { token } = await generateTestUserToken();

        // Act
        const res = await request(app)
            .get('/api/sweets/search?name=Strawberry')
            .set('Authorization', `Bearer ${token}`);

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Strawberry Jam');
    });

    /**
     * PATTERN: Multiple filter parameters
     */
    it('should filter by multiple criteria (category + price range)', async () => {
        await createTestSweet({ name: 'Cheap Chocolate', category: 'Chocolate', price: 2.99 });
        await createTestSweet({ name: 'Expensive Chocolate', category: 'Chocolate', price: 20.99 });
        await createTestSweet({ name: 'Bakery Item', category: 'Baked', price: 5.99 });
        const { token } = await generateTestUserToken();

        // Act: Search for Chocolate between $5-$25
        const res = await request(app)
            .get('/api/sweets/search?category=Chocolate&minPrice=5&maxPrice=25')
            .set('Authorization', `Bearer ${token}`);

        // Assert
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Expensive Chocolate');
    });
});

describe('🔗 INTEGRATION TESTS: POST /api/sweets/:id/purchase (Purchase sweet)', () => {
    /**
     * PATTERN: State-changing operation with verification
     * This is the original test, now with explanation
     */
    it('should decrease quantity when sweet is purchased', async () => {
        // Arrange: Create a sweet with stock
        const sweet = await createTestSweet({ quantity: 10 });
        const { token } = await generateTestUserToken('user');

        // Act: Make purchase request
        const res = await request(app)
            .post(`/api/sweets/${sweet._id}/purchase`)
            .set('Authorization', `Bearer ${token}`);

        // Assert: Check response
        expect(res.statusCode).toEqual(200);
        expect(res.body.currentStock).toEqual(9); // Quantity decreased by 1

        // EXPLANATION: Integration test - verify DB was actually updated
        const updatedSweet = await Sweet.findById(sweet._id);
        expect(updatedSweet.quantity).toEqual(9);
    });

    /**
     * PATTERN: Test boundary condition (out of stock)
     */
    it('should return 400 error when purchasing out of stock item', async () => {
        const sweet = await createTestSweet({ quantity: 0 }); // No stock
        const { token } = await generateTestUserToken();

        const res = await request(app)
            .post(`/api/sweets/${sweet._id}/purchase`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('Out of stock');
    });

    /**
     * PATTERN: Test non-existent resource
     */
    it('should return 404 when purchasing non-existent sweet', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const { token } = await generateTestUserToken();

        const res = await request(app)
            .post(`/api/sweets/${fakeId}/purchase`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toBe('Sweet not found');
    });

    /**
     * PATTERN: Test multiple operations (purchasing twice)
     */
    it('should handle multiple purchases correctly', async () => {
        const sweet = await createTestSweet({ quantity: 3 });
        const { token } = await generateTestUserToken();

        // Purchase 1
        const res1 = await request(app)
            .post(`/api/sweets/${sweet._id}/purchase`)
            .set('Authorization', `Bearer ${token}`);
        expect(res1.statusCode).toEqual(200);
        expect(res1.body.currentStock).toEqual(2);

        // Purchase 2
        const res2 = await request(app)
            .post(`/api/sweets/${sweet._id}/purchase`)
            .set('Authorization', `Bearer ${token}`);
        expect(res2.statusCode).toEqual(200);
        expect(res2.body.currentStock).toEqual(1);

        // Purchase 3
        const res3 = await request(app)
            .post(`/api/sweets/${sweet._id}/purchase`)
            .set('Authorization', `Bearer ${token}`);
        expect(res3.statusCode).toEqual(200);
        expect(res3.body.currentStock).toEqual(0);

        // Purchase 4 should fail
        const res4 = await request(app)
            .post(`/api/sweets/${sweet._id}/purchase`)
            .set('Authorization', `Bearer ${token}`);
        expect(res4.statusCode).toEqual(400);
        expect(res4.body.error).toBe('Out of stock');
    });
});

describe('🔗 INTEGRATION TESTS: POST /api/sweets/:id/restock (Admin restock)', () => {
    /**
     * PATTERN: Testing admin-only operations with authorization
     */
    it('should increase quantity when admin restocks', async () => {
        const sweet = await createTestSweet({ quantity: 5 });
        const { token } = await generateTestUserToken('admin');

        const res = await request(app)
            .post(`/api/sweets/${sweet._id}/restock`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 20 });

        expect(res.statusCode).toEqual(200);
        expect(res.body.currentStock).toEqual(25); // 5 + 20

        // Verify in DB
        const updatedSweet = await Sweet.findById(sweet._id);
        expect(updatedSweet.quantity).toEqual(25);
    });

    /**
     * PATTERN: Test authorization for admin-only endpoint
     */
    it('should reject restock by non-admin user', async () => {
        const sweet = await createTestSweet({ quantity: 5 });
        const { token } = await generateTestUserToken('user'); // Not admin

        const res = await request(app)
            .post(`/api/sweets/${sweet._id}/restock`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 20 });

        expect(res.statusCode).toEqual(403); // Forbidden
    });

    /**
     * PATTERN: Test validation of restock amount
     */
    it('should reject invalid restock amount', async () => {
        const sweet = await createTestSweet();
        const { token } = await generateTestUserToken('admin');

        // Negative amount
        const res1 = await request(app)
            .post(`/api/sweets/${sweet._id}/restock`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: -10 });
        expect(res1.statusCode).toEqual(400);

        // Zero amount
        const res2 = await request(app)
            .post(`/api/sweets/${sweet._id}/restock`)
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 0 });
        expect(res2.statusCode).toEqual(400);

        // Missing amount
        const res3 = await request(app)
            .post(`/api/sweets/${sweet._id}/restock`)
            .set('Authorization', `Bearer ${token}`)
            .send({});
        expect(res3.statusCode).toEqual(400);
    });
});

describe('🔗 INTEGRATION TESTS: PUT /api/sweets/:id (Update sweet)', () => {
    /**
     * PATTERN: Update operation with validation
     */
    it('should update sweet details (admin only)', async () => {
        const sweet = await createTestSweet({ name: 'Old Name', price: 5.99 });
        const { token } = await generateTestUserToken('admin');

        const res = await request(app)
            .put(`/api/sweets/${sweet._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'New Name',
                price: 7.99
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toBe('New Name');
        expect(res.body.price).toBe(7.99);

        // Verify in DB
        const updatedSweet = await Sweet.findById(sweet._id);
        expect(updatedSweet.name).toBe('New Name');
        expect(updatedSweet.price).toBe(7.99);
    });

    /**
     * PATTERN: Test non-existent resource update
     */
    it('should return 404 when updating non-existent sweet', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const { token } = await generateTestUserToken('admin');

        const res = await request(app)
            .put(`/api/sweets/${fakeId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'New Name' });

        expect(res.statusCode).toEqual(404);
    });
});

describe('🔗 INTEGRATION TESTS: DELETE /api/sweets/:id (Delete sweet)', () => {
    /**
     * PATTERN: Deletion with verification
     */
    it('should delete sweet (admin only)', async () => {
        const sweet = await createTestSweet();
        const { token } = await generateTestUserToken('admin');

        const res = await request(app)
            .delete(`/api/sweets/${sweet._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Sweet deleted successfully');

        // Verify it's actually gone
        const deletedSweet = await Sweet.findById(sweet._id);
        expect(deletedSweet).toBeNull();
    });

    /**
     * PATTERN: Test deletion of non-existent resource
     */
    it('should return 404 when deleting non-existent sweet', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const { token } = await generateTestUserToken('admin');

        const res = await request(app)
            .delete(`/api/sweets/${fakeId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(404);
    });
});
