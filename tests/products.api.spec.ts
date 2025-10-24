import type { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const buildAuthToken = (payload: Record<string, unknown> = {}) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(
        {
            sub: 'tester',
            email: 'tester@example.com',
            ...payload
        },
        secret,
        { expiresIn: '1h' }
    );
};

describe('Products API', () => {
    let app: Express;
    let authToken: string;
    let createdProductId: number;

    const basePayload = {
        name: 'Test Product',
        description: 'A secure test product',
        price: 49.99,
        stock: 25,
        size: 'M',
        color: 'Blue',
        brand: 'SecureBrand',
        subcategory: {
            id: 1,
            name: 'Sneakers',
            description: 'Sneakers for testing',
            category: {
                id: 1,
                name: 'Footwear',
                description: 'All kinds of footwear'
            }
        }
    };

    beforeAll(async () => {
        authToken = buildAuthToken();
        const module = await import('../src/index');
        app = module.default;
    });

    it('rejects protected calls without a bearer token', async () => {
        const response = await request(app).post('/api/products').send(basePayload);
        expect(response.status).toBe(401);
        expect(response.body).toMatchObject({
            success: false,
            message: expect.stringContaining('Token required')
        });
    });

    it('creates a product when payload and token are valid', async () => {
        const response = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send(basePayload);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            success: true,
            data: expect.objectContaining({
                name: basePayload.name,
                createdBy: 'tester'
            })
        });

        createdProductId = response.body.data.id;
        expect(createdProductId).toBeGreaterThan(0);
    });

    it('blocks malformed product payloads', async () => {
        const invalidPayload = {
            ...basePayload,
            name: '',
            price: -10
        };

        const response = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send(invalidPayload);

        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({
            success: false
        });
    });

    it('lists products publicly', async () => {
        const response = await request(app).get('/api/products');
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            success: true,
            count: expect.any(Number)
        });
        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: createdProductId,
                    name: basePayload.name
                })
            ])
        );
    });

    it('applies partial updates securely', async () => {
        const response = await request(app)
            .patch(`/api/products/${createdProductId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ stock: 30 });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            success: true,
            data: expect.objectContaining({
                id: createdProductId,
                stock: 30
            })
        });
    });
});
