-- Rebuild both sides of the foreign key together, preserving all saved records.
CREATE TABLE submissions_next (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('lead','investor','career','contact','partner')),
  data text NOT NULL CHECK (json_valid(data)),
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','em_atendimento','concluido','arquivado')),
  upload_id text REFERENCES uploads(id),
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  request_key text,
  request_hash text
);
INSERT INTO submissions_next(id,kind,data,status,upload_id,created_at)
SELECT id,CASE WHEN kind='contact' AND json_extract(data,'$.origem')='Site DayTrade - Parceiro Indicador' THEN 'partner' ELSE kind END,
  data,status,upload_id,created_at FROM submissions;

CREATE TABLE webhook_jobs_next (
  id text PRIMARY KEY,
  submission_id text NOT NULL UNIQUE REFERENCES submissions_next(id) ON DELETE CASCADE,
  destination text NOT NULL CHECK (destination IN ('lead','investor','career','contact','partner')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','sent','failed')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_error text,
  sent_at text,
  created_at text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
INSERT INTO webhook_jobs_next SELECT * FROM webhook_jobs;
DROP TABLE webhook_jobs;
DROP TABLE submissions;
ALTER TABLE submissions_next RENAME TO submissions;
ALTER TABLE webhook_jobs_next RENAME TO webhook_jobs;
CREATE INDEX submissions_created ON submissions(created_at DESC);
CREATE INDEX submissions_kind_status ON submissions(kind,status);
CREATE UNIQUE INDEX submissions_request_key ON submissions(kind,request_key) WHERE request_key IS NOT NULL;
CREATE INDEX webhook_jobs_pending ON webhook_jobs(status,next_attempt_at);
