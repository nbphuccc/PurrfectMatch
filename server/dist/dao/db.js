// src/dao/db.ts
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
// Allow tests to override: DB_PATH=":memory:"
const DEFAULT_DB_PATH = path.resolve(process.cwd(), "db", "purrfectmatch.db");
const DB_PATH = process.env.DB_PATH || DEFAULT_DB_PATH;
const db = new Database(DB_PATH);
db.pragma("foreign_keys = ON");
// If you keep schema in db/schema.sql, auto-run it on startup (works for :memory: too)
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema.sql");
if (fs.existsSync(SCHEMA_PATH)) {
    const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
    db.exec(schema);
}
export default db;
//# sourceMappingURL=db.js.map