/// <reference types="jest" />
import request from "supertest";

// ESM note: use .js on local paths (ts-jest will map them)
// Import the Express app (no .listen() inside app.ts)
import app from "../../src/app.js";
// Import the DB (better-sqlite3)
import db from "../../src/dao/db.js";

describe("PLAYDATE POSTS", () => {
  let testUserId: number;

  beforeAll(() => {
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS playdate_posts(
        id INTEGER PRIMARY KEY,
        userId INTEGER NOT NULL,
        dog_breed TEXT NOT NULL,
        dog_age INTEGER,
        preferred_time TEXT,
        location TEXT,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  });

  beforeEach(() => {
    // Clear all data before each test
    db.exec("DELETE FROM comments");
    db.exec("DELETE FROM playdate_posts");
    db.exec("DELETE FROM community_posts");
    db.exec("DELETE FROM users");
    
    // Create a test user directly in DB
    const result = db.prepare(`
      INSERT INTO users (email, username, pass_hash, name)
      VALUES (?, ?, ?, ?)
    `).run("test@example.com", "testuser", "hashedpass", "Test User");
    
    testUserId = result.lastInsertRowid as number;
  });

  test("GET /playdates should start empty", async () => {
    const res = await request(app).get("/playdates");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(0);
  });
});