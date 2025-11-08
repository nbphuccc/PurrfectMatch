import express from 'express';
import request from 'supertest';
import communityRouter from '../../src/routes/community.js';
import db from '../../src/dao/db.js';

const app = express();
app.use(express.json());
app.use('/community', communityRouter);

describe('Community routes', () => {
	test('GET /community returns empty list initially', async () => {
		const res = await request(app).get('/community');
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('items');
		expect(Array.isArray(res.body.items)).toBe(true);
	});

	test('POST /community and GET /community/:id workflow', async () => {
		const createRes = await request(app).post('/community').send({
			author_id: 1,
			title: 'Hello',
			description: 'First post'
		});
		expect(createRes.status).toBe(201);
		const id = createRes.body.id;
		// ensure we received an id back from creation
		expect(id).toBeDefined();

		// verify the DB actually has the post we just created
		const row = db.prepare('SELECT id FROM community_posts WHERE id = ?').get(id);
		expect(row).toBeDefined();

		const getRes = await request(app).get(`/community/${id}`);
		expect(getRes.status).toBe(200);
		expect(getRes.body.title).toBe('Hello');

		const patchRes = await request(app).patch(`/community/${id}`).send({ title: 'Updated' });
		expect(patchRes.status).toBe(200);
		expect(patchRes.body.title).toBe('Updated');

		const delRes = await request(app).delete(`/community/${id}`);
		expect(delRes.status).toBe(204);
	});

	test('POST /community/:id/comments and GET comments', async () => {
		// create a user then a community post directly in DB (avoid relying on POST->same module instance)
		const userRes = db.prepare(`
					INSERT INTO users (email, username, pass_hash, name)
					VALUES (?, ?, ?, ?)
				`).run('c@c.com', 'cuser', 'pass', 'C User');
		const userId = userRes.lastInsertRowid as number;

		const now = new Date().toISOString();
		const info = db.prepare(`
					INSERT INTO community_posts (author_id, title, description, created_at)
					VALUES (?, ?, ?, ?)
				`).run(userId, 'For comments', 'Testing comments', now);
		const id = info.lastInsertRowid as number;

		const commentRes = await request(app).post(`/community/${id}/comments`).send({
			author_id: 2,
			body: 'Nice post'
		});
		if (commentRes.status !== 201) {
			throw new Error(`expected 201 when creating comment, got ${commentRes.status} - body: ${JSON.stringify(commentRes.body)}`);
		}

		const listRes = await request(app).get(`/community/${id}/comments`);
		expect(listRes.status).toBe(200);
		expect(Array.isArray(listRes.body.items)).toBe(true);
	});
});