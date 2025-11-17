import request from 'supertest';

// Use in-memory DB for fast, isolated tests
process.env.DB_PATH = ':memory:';

import app from '../../../src/app.js';
import db from '../../../src/dao/db.js';

describe('Playdates integration', () => {
    beforeAll(() => {
        // create minimal tables required for playdate tests
        db.exec(`
      CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, username TEXT UNIQUE NOT NULL, pass_hash TEXT NOT NULL, name TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS playdate_posts(id INTEGER PRIMARY KEY, author_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, dog_breed TEXT NOT NULL, address TEXT, city TEXT, state TEXT, zip TEXT, when_at TEXT, place TEXT, image_url TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    `);
    });

    beforeEach(() => {
        // Turn off foreign key checks during cleanup so parent/child ordering doesn't fail
        db.exec('PRAGMA foreign_keys = OFF;');
        try {
            db.exec('DELETE FROM playdate_posts');
            db.exec('DELETE FROM users');
            db.exec('DELETE FROM comments');
        } catch (e) {
            // If some tables don't exist yet, ignore errors during cleanup
        }
        db.exec('PRAGMA foreign_keys = ON;');
    });

    it('creates a playdate with POST and returns 201', async () => {
        const user = db.prepare(`INSERT INTO users (email, username, pass_hash, name) VALUES (?, ?, ?, ?);`).run('u@example.com', 'u', 'p', 'U');
        const dto = {
            author_id: user.lastInsertRowid,
            title: 'Park meetup',
            description: 'Bring your dog',
            dog_breed: 'Labrador',
            address: '1 Park Ave',
            city: 'Town',
            state: 'ST',
            zip: '12345',
            when_at: '2025-11-16T10:00:00Z',
            place: 'Central Park',
            image_url: null
        };

        const res = await request(app).post('/playdates').send(dto);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe(dto.title);
    });

    it('lists playdates with GET /playdates', async () => {
        const user = db.prepare(`INSERT INTO users (email, username, pass_hash, name) VALUES (?, ?, ?, ?);`).run('v@example.com', 'v', 'p', 'V');
        db.prepare(`INSERT INTO playdate_posts (author_id,title,description,dog_breed,address,city,state,zip,when_at,place,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(user.lastInsertRowid, 'Title', 'Desc', 'Poodle', 'a', 'b', 'c', 'd', 'now', 'p', 'now');

        const res = await request(app).get('/playdates');
        expect(res.status).toBe(200);
        expect(res.body.items.length).toBeGreaterThan(0);
    });
});
