CREATE TABLE admin_users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE admin_sessions (
  token_hash text PRIMARY KEY,
  user_id text NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at text NOT NULL,
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX admin_sessions_expiry ON admin_sessions(expires_at);
CREATE TABLE rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  reset_at text NOT NULL
);
CREATE TABLE uploads (
  id text PRIMARY KEY,
  path text NOT NULL UNIQUE,
  original_name text NOT NULL,
  mime text NOT NULL,
  bytes integer NOT NULL CHECK (bytes > 0 AND bytes <= 5242880),
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE submissions (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('lead','investor','career','contact')),
  data text NOT NULL CHECK (json_valid(data)),
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','em_atendimento','concluido','arquivado')),
  upload_id text REFERENCES uploads(id),
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX submissions_created ON submissions(created_at DESC);
CREATE INDEX submissions_kind_status ON submissions(kind,status);
CREATE TABLE webhook_jobs (
  id text PRIMARY KEY,
  submission_id text NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  destination text NOT NULL CHECK (destination IN ('lead','investor','career')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','sent','failed')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_error text,
  sent_at text,
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX webhook_jobs_pending ON webhook_jobs(status,next_attempt_at);
CREATE TABLE blog_posts (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  cover text NOT NULL DEFAULT '/images/hero-office.png',
  published integer NOT NULL DEFAULT 0 CHECK (published IN (0,1)),
  published_at text,
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX blog_posts_public ON blog_posts(published,published_at DESC);
