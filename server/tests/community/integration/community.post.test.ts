/**
 * Integration tests for community routes.
 * These tests spin up the Express app with an in-memory SQLite DB so they can
 * exercise route validation and persistence without touching disk.
 * Location: server/tests/community/integration/
 */
import request from 'supertest';

// Ensure the server uses in-memory DB for tests
process.env.DB_PATH = ':memory:';

import app from '../../../src/app.js';

describe('POST /community', () => {
    it('returns 400 when required fields missing', async () => {
        const res = await request(app).post('/community').send({});
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('creates a community post when valid', async () => {
        const dto = {
            author_id: 1,
            title: 'Resource - Cat',
            description: 'Looking for a vet',
            image_url: null,
        };
        const res = await request(app).post('/community').send(dto);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe(dto.title);
        expect(res.body.description).toBe(dto.description);
    });
});
