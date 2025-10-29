import { Router } from "express";
import db from "../dao/db.js";

const router = Router();

// DELETE /comments/:id
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const changes = db.prepare("DELETE FROM comments WHERE id = ?").run(id).changes;
  if (!changes) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

export default router;
