import { Router } from "express";
import db from "../dao/db.js";

const router = Router();

// GET /playdates  -> list newest first
router.get("/", (_req, res) => {
  const items = db
    .prepare("SELECT * FROM playdate_posts ORDER BY datetime(created_at) DESC")
    .all();
  res.json({ items });
});

// POST /playdates  -> create a playdate post (validate required fields)
router.post("/", (req, res) => {
  const required = [
    "author_id",
    "title",
    "description",
    "dog_breed",
    "address",
    "city",
    "state",
    "zip",
    "when_at",
    "place",
  ];
  for (const k of required) {
    if (!req.body?.[k]) {
      return res.status(400).json({ error: `${k} is required` });
    }
  }

  const {
    author_id,
    title,
    description,
    dog_breed,
    address,
    city,
    state,
    zip,
    when_at,
    place,
    image_url,
  } = req.body;

  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO playdate_posts (
      author_id, title, description, dog_breed, address, city, state, zip,
      when_at, place, image_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    author_id,
    title,
    description,
    dog_breed,
    address,
    city,
    state,
    zip,
    when_at,
    place,
    image_url ?? null,
    now
  );

  const created = db
    .prepare("SELECT * FROM playdate_posts WHERE id = ?")
    .get(info.lastInsertRowid);

  res.status(201).json(created);
});

export default router;
