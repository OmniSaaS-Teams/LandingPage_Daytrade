import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

type Row = Record<string, unknown>;
export type QueryResult<T> = { rows: T[]; rowCount: number };
export type DatabaseClient = { query<T = Row>(sql: string, values?: unknown[]): Promise<QueryResult<T>>; exec(sql: string): Promise<void> };
type State = { connection?: DatabaseSync; file?: string; queue: Promise<void> };
const shared = globalThis as typeof globalThis & { daytradeSqlite?: State };
const state = shared.daytradeSqlite ??= { queue: Promise.resolve() };

export function databaseFile() {
  return resolve(/* turbopackIgnore: true */ process.env.DATABASE_FILE || "./data/daytrade.sqlite");
}
function connection() {
  const file = databaseFile();
  if (state.connection && state.file !== file) throw new Error("Feche a conexão antes de trocar DATABASE_FILE.");
  if (!state.connection) {
    mkdirSync(/* turbopackIgnore: true */ dirname(file), { recursive: true, mode: 0o700 });
    state.connection = new DatabaseSync(file);
    chmodSync(/* turbopackIgnore: true */ file, 0o600);
    state.file = file;
    state.connection.exec("PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;");
  }
  return state.connection;
}

// Serialize async transactions within a process. SQLite coordinates the web,
// worker and maintenance processes through BEGIN IMMEDIATE and busy_timeout.
async function locked<T>(work: () => T | Promise<T>): Promise<T> {
  const previous = state.queue;
  let release!: () => void;
  state.queue = new Promise<void>(resolve => { release = resolve; });
  await previous;
  try { return await work(); } finally { release(); }
}
function execute<T>(sql: string, values: unknown[] = []): QueryResult<T> {
  const statement = connection().prepare(sql);
  const bindings: Record<string, SQLInputValue> = {};
  values.forEach((value, index) => {
    if (value === undefined || value === null) bindings[`$${index + 1}`] = null;
    else if (typeof value === "boolean") bindings[`$${index + 1}`] = value ? 1 : 0;
    else if (value instanceof Date) bindings[`$${index + 1}`] = value.toISOString();
    else if (["string", "number", "bigint"].includes(typeof value) || ArrayBuffer.isView(value)) bindings[`$${index + 1}`] = value as SQLInputValue;
    else bindings[`$${index + 1}`] = JSON.stringify(value);
  });
  if (statement.columns().length) {
    const rows = (values.length ? statement.all(bindings) : statement.all()).map(raw => {
      const row: Row = { ...raw };
      if (typeof row.data === "string") row.data = JSON.parse(row.data);
      if ("published" in row) row.published = Boolean(row.published);
      return row as T;
    });
    return { rows, rowCount: rows.length };
  }
  const result = values.length ? statement.run(bindings) : statement.run();
  return { rows: [], rowCount: Number(result.changes) };
}
export const db = {
  async exec(sql: string) { return locked(() => connection().exec(sql)); },
  async query<T = Row>(sql: string, values: unknown[] = []) {
    return locked(() => execute<T>(sql, values));
  },
  async transaction<T>(work: (client: DatabaseClient) => Promise<T>): Promise<T> {
    return locked(async () => {
      const sqlite = connection();
      sqlite.exec("BEGIN IMMEDIATE");
      try {
        const result = await work({ query: async <R = Row>(sql: string, values: unknown[] = []) => execute<R>(sql, values), exec: async sql => { sqlite.exec(sql); } });
        sqlite.exec("COMMIT");
        return result;
      } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    });
  },
  async close() {
    return locked(() => { state.connection?.close(); state.connection = undefined; state.file = undefined; });
  },
};
