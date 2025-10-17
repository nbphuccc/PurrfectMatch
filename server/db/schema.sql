CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  name TEXT, bio TEXT, city TEXT,
  email_public INTEGER DEFAULT 0,
  avatar_url TEXT, created_at TEXT
);

CREATE TABLE IF NOT EXISTS posts(
  id INTEGER PRIMARY KEY,
  author_id INTEGER REFERENCES users(id),
  type TEXT CHECK(type IN('playdate','community')),
  title TEXT, description TEXT NOT NULL,
  pet_type TEXT, city TEXT, zip TEXT,
  when_at TEXT, place TEXT,
  contact_email TEXT,
  image_url TEXT, created_at TEXT, expires_at TEXT
);

CREATE TABLE IF NOT EXISTS comments(
  id INTEGER PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id),
  author_id INTEGER REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT
);