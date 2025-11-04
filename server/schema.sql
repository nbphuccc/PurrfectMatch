CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  pass_hash TEXT NOT NULL,
  name TEXT,
  bio TEXT,
  email_public INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TEXT
);
CREATE TABLE IF NOT EXISTS playdate_posts(
  id INTEGER PRIMARY KEY,
  author_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  dog_breed TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  when_at TEXT NOT NULL,
  place TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS community_posts(
  id INTEGER PRIMARY KEY,
  author_id INTEGER REFERENCES users(id),
  title TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS comments(
  id INTEGER PRIMARY KEY,
  post_type TEXT NOT NULL CHECK (post_type IN ('community','playdate')),
  post_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_type, post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at);