CREATE TABLE instagram_connection (
  id integer PRIMARY KEY CHECK (id=1),
  username text NOT NULL,
  token_ciphertext text NOT NULL,
  updated_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
