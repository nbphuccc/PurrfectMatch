import bcrypt from "bcrypt";
import db from "../dao/db.js";

export const AuthService = {
  signup(email: string, username: string, password: string) {
    const checkStmt = db.prepare(
      "SELECT * FROM users WHERE email = ? OR username = ?"
    );
    const existingUser = checkStmt.get(email, username);

    if (existingUser) {
      return { ok: false, message: "Email or username already exists" };
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const insertStmt = db.prepare(
      "INSERT INTO users (email, username, pass_hash) VALUES (?, ?, ?)"
    );
    const result = insertStmt.run(email, username, hashedPassword);

    return {
      ok: true,
      user: { id: result.lastInsertRowid, email, username },
    };
  },

  // --- LOGIN SERVICE ---
   login(loginId: string, password: string) {
    const stmt = db.prepare(
        "SELECT * FROM users WHERE email = ? OR username = ?");

    const user = stmt.get(loginId, loginId) as {
      id: number;
      email: string;
      username: string;
      pass_hash: string;
    } | undefined;

    if (!user) {
      return { ok: false, message: "User not found" };
    }

    const passwordMatches = bcrypt.compareSync(password, user.pass_hash);
    if (!passwordMatches) {
      return { ok: false, message: "Invalid password" };
    }

    return {
      ok: true,
      user: { id: user.id, email: user.email, username: user.username },
    };
  },
};
