/*
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: "No access token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    (req as any).user = payload; // attach user info
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
*/