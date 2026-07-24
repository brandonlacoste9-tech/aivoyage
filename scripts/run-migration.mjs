/**
 * Apply supabase/migrations/001_init.sql
 *
 * Preferred for most users: Supabase Dashboard → SQL Editor → paste the file.
 *
 * Optional CLI (needs Direct or Pooler connection string):
 *   DATABASE_URL="postgresql://..." node scripts/run-migration.mjs
 *   # or
 *   SUPABASE_DB_PASSWORD=... SUPABASE_DB_HOST=db.xxx.supabase.co node scripts/run-migration.mjs
 */
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const password = process.env.SUPABASE_DB_PASSWORD || process.argv[2];
const host =
  process.env.SUPABASE_DB_HOST || "db.svmjejrwsjdasxiclwiz.supabase.co";
const url =
  process.env.DATABASE_URL ||
  (password
    ? `postgresql://postgres:${encodeURIComponent(password)}@${host}:5432/postgres`
    : null);

if (!url) {
  console.error(`Missing connection string.

Option A (easiest): open Supabase → SQL Editor and run:
  supabase/migrations/001_init.sql

Option B (CLI): set DATABASE_URL from Project Settings → Database
  DATABASE_URL="postgresql://postgres:...@db.<ref>.supabase.co:5432/postgres" node scripts/run-migration.mjs
`);
  process.exit(1);
}

const sqlPath = path.join(root, "supabase/migrations/001_init.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Connected");
  await client.query(sql);
  console.log("Migration applied successfully");
  const tables = await client.query(
    "select tablename from pg_tables where schemaname = 'public' order by 1",
  );
  console.log("Tables:", tables.rows.map((r) => r.tablename).join(", "));
} catch (e) {
  console.error("ERROR:", e.message);
  console.error(
    "\nTip: use the connection string from Supabase → Project Settings → Database.\nIf direct host fails, use the Session pooler URI and port 5432.",
  );
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
