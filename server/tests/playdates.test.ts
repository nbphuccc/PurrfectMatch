/// <reference types="jest" />
import request from "supertest";

// ESM note: use .js on local paths (ts-jest will map them)
// Import the Express app (no .listen() inside app.ts)
import app from "../src/app.js";
// Import the DB (better-sqlite3)
import db from "../src/dao/db.js";

describe("PLAYDATE POSTS", () => {
  beforeAll(() => {
    // If your Jest setup doesn't already set DB_PATH=":memory:",
    // uncomment the next line and run tests with isolated modules.
    // process.env.DB_PATH = ":memory:";

    // Create tables if not already created by your db bootstrap
    db.exec(`
      CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        pass_hash TEXT NOT NULL,
        name TEXT NOT NULL, 
        bio TEXT,
        email_public INTEGER DEFAULT 0,
        avatar_url TEXT, 
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS playdate_posts(
        id INTEGER PRIMARY KEY,
        author_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL, 
        description TEXT NOT NULL,
        dog_breed TEXT NOT NULL, 
        address TEXT NOT NULL, 
        city TEXT NOT NULL, 
        state TEXT NOT NULL, 
        zip TEXT NOT NULL, 
        when_at TEXT NOT NULL, 
        place TEXT NOT NULL, 
        image_url TEXT, 
        created_at TEXT NOT NULL
      );
    `);

    // Seed a user for FK author_id
    const now = new Date().toISOString();
    db.prepare(`
      INSERT OR IGNORE INTO users (id, email, username, pass_hash, name, created_at)
      VALUES (1, 'test@example.com', 'tester', 'hashed_pw', 'Test User', ?)
    `).run(now);
  });

  afterAll(() => {
    // Close DB so Jest exits cleanly
    // @ts-ignore - typings may not expose .close
    db.close?.();
  });

  test("GET /playdates should start empty", async () => {
    const res = await request(app).get("/playdates");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(0);
  });

  test("POST /playdates creates a playdate post when all required fields provided", async () => {
    const res = await request(app)
      .post("/playdates")
      .send({
        author_id: 1,
        title: "Green Lake Pups",
        description: "Small/medium dogs welcome",
        dog_breed: "Corgi",
        address: "123 Green Lake Way N",
        city: "Seattle",
        state: "WA",
        zip: "98103",
        when_at: "2025-11-01T10:00:00Z",
        place: "Green Lake Park",
        image_url: null
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Green Lake Pups");
    expect(res.body.city).toBe("Seattle");
  });

  test("GET /playdates shows the created post", async () => {
    const res = await request(app).get("/playdates");
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].dog_breed).toBe("Corgi");
  });

  test("POST /playdates rejects missing required fields", async () => {
    const res = await request(app)
      .post("/playdates")
      .send({
        author_id: 1,
        // title missing on purpose
        description: "oops",
        dog_breed: "Corgi",
        address: "somewhere",
        city: "Seattle",
        state: "WA",
        zip: "98103",
        when_at: "2025-11-01T10:00:00Z",
        place: "Park"
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });
});
