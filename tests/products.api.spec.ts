import type { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, beforeAll, it, expect } from 'vitest';

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
        app = module.default as Express;
    });

    it('Rechazar petición post sin token', async () => {
        const response = await request(app).post('/api/products').send(basePayload);
        expect(response.status).toBe(401);
        expect(response.body).toMatchObject({
            success: false,
            message: expect.stringContaining('Token required')
        });
    });

    it('Crear producto con validación de payload y token', async () => {
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

    const buildLargePayload = () => {
        const targetSizeBytes = 99 * 1024;
        const clone = JSON.parse(JSON.stringify(basePayload));
        clone.name = 'Large Payload Product';
        const baseWithoutPadding = { ...clone, padding: '' };
        const baseSize = Buffer.byteLength(JSON.stringify(baseWithoutPadding));
        const fillerLength = Math.max(0, targetSizeBytes - baseSize);
        clone.padding = 'X'.repeat(fillerLength);

        let payloadSize = Buffer.byteLength(JSON.stringify(clone));
        if (payloadSize >= 102400) {
            const overshoot = payloadSize - 102399;
            clone.padding = clone.padding.slice(0, -overshoot);
            payloadSize = Buffer.byteLength(JSON.stringify(clone));
        }

        return { clone, payloadSize };
    };

    it('Bloqueo de payloads malformados', async () => {
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

    it('Permite payloads cercanos a 99kb sin exceder el límite', async () => {
        const { clone: largePayload, payloadSize } = buildLargePayload();

        expect(payloadSize).toBeGreaterThan(99 * 1024 - 512);
        expect(payloadSize).toBeLessThan(102400);

        const response = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${authToken}`)
            .send(largePayload);

        expect(response.status).toBe(201);
        expect(response.body).toMatchObject({
            success: true,
            data: expect.objectContaining({
                name: 'Large Payload Product'
            })
        });
        expect(response.body.data.padding).toBeUndefined();
    });

    it('Listar productos publicos', async () => {
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

    it('aplicar actualización parcial de manera segura', async () => {
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
