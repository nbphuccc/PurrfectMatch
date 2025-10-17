import Database from "better-sqlite3";

const db: Database.Database = new Database("./db/purrfectmatch.db", { verbose: console.log });
db.pragma("foreign_keys = ON");

export default db;