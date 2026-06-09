import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function createPool() {
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "SUPABASE_DB_URL (or DATABASE_URL) must be set.",
    );
  }
  const isSupabase = !!process.env.SUPABASE_DB_URL;
  return new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  });
}

let _pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getPool(): pg.Pool {
  if (!_pool) _pool = createPool();
  return _pool;
}

export const pool: pg.Pool = new Proxy({} as pg.Pool, {
  get(_target, prop) {
    return (getPool() as any)[prop];
  },
});

export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy({} as any, {
  get(_target, prop) {
    if (!_db) _db = drizzle(getPool(), { schema });
    return (_db as any)[prop];
  },
});

export * from "./schema";
