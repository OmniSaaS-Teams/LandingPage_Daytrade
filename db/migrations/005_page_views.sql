CREATE TABLE page_views (
  id TEXT PRIMARY KEY NOT NULL,
  path TEXT NOT NULL,
  ip TEXT,
  viewed_at INTEGER NOT NULL
);

CREATE INDEX page_views_viewed_at_idx ON page_views(viewed_at);
CREATE INDEX page_views_path_viewed_at_idx ON page_views(path, viewed_at);
