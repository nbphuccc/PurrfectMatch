import { Router } from "express";
import db from "../dao/db.js";
import { requireFields, pickDefined } from "../utils/validate.js";
const router = Router();
// GET /playdates? city=& q=& page=& limit=
router.get("/", (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
    const whereParts = [];
    const vals = [];
    if (city) {
        whereParts.push("city = ?");
        vals.push(city);
    }
    if (q) {
        whereParts.push("(title LIKE ? OR description LIKE ? OR dog_breed LIKE ?)");
        vals.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";
    const items = db.prepare(`SELECT * FROM playdate_posts ${whereSql} ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?`).all(...vals, limit, (page - 1) * limit);
    res.json({ items, page, limit });
});
// GET /playdates/:id
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const row = db.prepare("SELECT * FROM playdate_posts WHERE id = ?").get(id);
    if (!row)
        return res.status(404).json({ error: "Not found" });
    res.json(row);
});
// POST /playdates
router.post("/", (req, res) => {
    const err = requireFields(req.body, [
        "author_id", "title", "description", "dog_breed", "address", "city", "state", "zip", "when_at", "place"
    ]);
    if (err)
        return res.status(400).json({ error: err });
    const { author_id, title, description, dog_breed, address, city, state, zip, when_at, place, image_url } = req.body;
    const now = new Date().toISOString();
    const info = db.prepare(`
    INSERT INTO playdate_posts (
      author_id, title, description, dog_breed, address, city, state, zip,
      when_at, place, image_url, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(Number(author_id), String(title), String(description), String(dog_breed), String(address), String(city), String(state), String(zip), String(when_at), String(place), image_url ?? null, now);
    const created = db.prepare("SELECT * FROM playdate_posts WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(created);
});
// PATCH /playdates/:id
router.patch("/:id", (req, res) => {
    const id = Number(req.params.id);
    const allowed = [
        "author_id", "title", "description", "dog_breed", "address", "city", "state", "zip", "when_at", "place", "image_url"
    ];
    const patch = pickDefined(req.body, allowed);
    if (Object.keys(patch).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
    }
    const setSql = Object.keys(patch).map((k) => `${k} = ?`).join(", ");
    const vals = [...Object.values(patch), id];
    const changes = db.prepare(`UPDATE playdate_posts SET ${setSql} WHERE id = ?`).run(...vals).changes;
    if (!changes)
        return res.status(404).json({ error: "Not found" });
    const updated = db.prepare("SELECT * FROM playdate_posts WHERE id = ?").get(id);
    res.json(updated);
});
// DELETE /playdates/:id
router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const changes = db.prepare("DELETE FROM playdate_posts WHERE id = ?").run(id).changes;
    if (!changes)
        return res.status(404).json({ error: "Not found" });
    res.status(204).end();
});
// --- COMMENTS (Playdates) ---
// GET /playdates/:id/comments
router.get("/:id/comments", (req, res) => {
    const postId = Number(req.params.id);
    const items = db.prepare(`SELECT * FROM comments WHERE post_type = 'playdate' AND post_id = ? ORDER BY datetime(created_at) ASC`).all(postId);
    res.json({ items });
});
// POST /playdates/:id/comments
// body: { author_id: number, body: string }
router.post("/:id/comments", (req, res) => {
    const postId = Number(req.params.id);
    // ensure the playdate post exists
    const post = db.prepare("SELECT id FROM playdate_posts WHERE id = ?").get(postId);
    if (!post)
        return res.status(404).json({ error: "Playdate post not found" });
    const err = requireFields(req.body, ["author_id", "body"]);
    if (err)
        return res.status(400).json({ error: err });
    const { author_id, body } = req.body;
    const now = new Date().toISOString();
    const info = db.prepare(`
	  INSERT INTO comments (post_type, post_id, author_id, body, created_at)
	  VALUES ('playdate', ?, ?, ?, ?)
	`).run(postId, Number(author_id), String(body), now);
    const created = db.prepare("SELECT * FROM comments WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(created);
});
export default router;
//# sourceMappingURL=playdates.js.map