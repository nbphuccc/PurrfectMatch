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
  post_id INTEGER REFERENCES community_posts(id),
  author_id INTEGER REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT
);