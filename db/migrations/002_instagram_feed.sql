CREATE TABLE instagram_feeds (
  username text PRIMARY KEY,
  posts text NOT NULL DEFAULT '[]' CHECK (json_valid(posts)),
  last_success_at text,
  next_attempt_at integer NOT NULL DEFAULT 0,
  lease_until integer NOT NULL DEFAULT 0,
  last_error text
);
