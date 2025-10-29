// Opens SQLite database (data.db),
// Executes schema file if the tables don’t exist,
// Exports the db object for DAOs.
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
const dbPath = path.resolve(__dirname, 'data.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');
// opent the database
const db = new Database(dbPath); // Added ": any" here to silence type re-export issue
// Read the SQL file as a string
const schema = fs.readFileSync(schemaPath, 'utf8');
// Execute the schema once (creates tables if not already there)
db.exec(schema);
export default db;
//# sourceMappingURL=index.js.map