#!/usr/bin/env node
import pg from "pg";
import { readdir, readFile } from "fs/promises";
import path from "path";

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://postgres:mRdlyMtcLEzKjCKRYnBDGjLIWOjcqmnc@altaria.proxy.rlwy.net:32348/railway";

console.log("Connecting to Railway Postgres...");
const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes("proxy.rlwy.net")
    ? { rejectUnauthorized: false }
    : dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") || dbUrl.includes(".railway.internal")
    ? false
    : { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    // Create Supabase-style roles & storage schema if not present so legacy migration scripts run seamlessly
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role; END IF;
      END $$;

      CREATE SCHEMA IF NOT EXISTS storage;

      CREATE TABLE IF NOT EXISTS storage.buckets (
        id text PRIMARY KEY,
        name text,
        public boolean DEFAULT false,
        file_size_limit bigint,
        allowed_mime_types text[]
      );

      CREATE TABLE IF NOT EXISTS storage.objects (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        bucket_id text,
        name text,
        owner uuid,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        metadata jsonb
      );
    `);

    const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    console.log(`Found ${files.length} migration files.`);

    // Create tracking table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const { rows: appliedRows } = await client.query(
      `SELECT filename FROM _schema_migrations`
    );
    const appliedSet = new Set(appliedRows.map((r) => r.filename));

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`[SKIP] ${file} (already applied)`);
        continue;
      }

      console.log(`[APPLYING] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = await readFile(filePath, "utf-8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO _schema_migrations (filename) VALUES ($1)`,
          [file]
        );
        await client.query("COMMIT");
        console.log(`[SUCCESS] ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`[ERROR] Failed to apply ${file}:`, err.message);
        throw err;
      }
    }

    // Ensure all 81 cities are enabled in sehir_acilis
    const turkiyeIlIlcePath = path.join(process.cwd(), "src", "data", "turkiye-il-ilce.json");
    try {
      const ilData = JSON.parse(await readFile(turkiyeIlIlcePath, "utf-8"));
      const iller = Object.keys(ilData);
      for (const il of iller) {
        await client.query(
          `INSERT INTO public.sehir_acilis (il, acik, guncelleme)
           VALUES ($1, true, NOW())
           ON CONFLICT (il) DO UPDATE SET acik = true, guncelleme = NOW()`,
          [il]
        );
      }
      console.log(`[CITIES] Enabled ${iller.length} cities in sehir_acilis.`);
    } catch (e) {
      console.warn("[CITIES] Warning populating cities:", e.message);
    }

    console.log("✅ All migrations applied successfully to Railway PostgreSQL!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
