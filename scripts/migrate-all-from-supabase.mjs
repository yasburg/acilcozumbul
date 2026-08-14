#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://nhmozloekphnjhjembus.supabase.co";
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5obW96bG9la3BobmpoamVtYnVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIyMTkyOSwiZXhwIjoyMDk1Nzk3OTI5fQ.x2CJc7S1c_QIa3L5WhmkjGMH1pJJAttTofNoLWm9wiQ";

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://postgres:mRdlyMtcLEzKjCKRYnBDGjLIWOjcqmnc@altaria.proxy.rlwy.net:32348/railway";

const uploadsDir =
  process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

console.log("==========================================");
console.log("  SUPABASE -> RAILWAY FULL DATA MIGRATION");
console.log("==========================================");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

const pgPool = new pg.Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes("proxy.rlwy.net")
    ? { rejectUnauthorized: false }
    : dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") || dbUrl.includes(".railway.internal")
    ? false
    : { rejectUnauthorized: false },
});

async function getAllRows(tableName) {
  const allRows = [];
  const pageSize = 1000;
  let page = 0;

  while (true) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .range(from, to);

    if (error) {
      if (error.code === "PGRST205" || error.message.includes("does not exist")) {
        return null; // Table doesn't exist on Supabase
      }
      throw error;
    }

    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  return allRows;
}

async function insertRowsToPg(client, tableName, rows) {
  if (!rows || rows.length === 0) return 0;

  // Get exact Postgres column data types
  const { rows: colDefs } = await client.query(
    `SELECT column_name, data_type, udt_name 
     FROM information_schema.columns 
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );

  const colTypes = {};
  for (const c of colDefs) {
    colTypes[c.column_name] = c;
  }

  // Truncate table first to guarantee clean insert without conflict issues
  await client.query(`TRUNCATE TABLE public."${tableName}" CASCADE;`);

  const sample = rows[0];
  // Filter keys to only those columns that exist in Railway Postgres table
  const keys = Object.keys(sample).filter((k) => colTypes[k]);
  if (keys.length === 0) return 0;

  const colNames = keys.map((k) => `"${k}"`).join(", ");

  let insertedCount = 0;
  const chunkSize = 200;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const valuesSql = [];
    const params = [];

    for (const row of chunk) {
      const rowPlaceholders = [];
      for (const key of keys) {
        let val = row[key];
        const colDef = colTypes[key];

        if (val !== null && val !== undefined) {
          if (colDef && (colDef.data_type === "jsonb" || colDef.data_type === "json")) {
            val = typeof val === "string" ? val : JSON.stringify(val);
          } else if (colDef && (colDef.data_type === "ARRAY" || colDef.udt_name.startsWith("_"))) {
            if (!Array.isArray(val) && typeof val === "string") {
              try {
                val = JSON.parse(val);
              } catch {}
            }
          } else if (typeof val === "object" && !(val instanceof Date)) {
            val = JSON.stringify(val);
          }
        } else {
          val = null;
        }

        params.push(val);
        rowPlaceholders.push(`$${params.length}`);
      }
      valuesSql.push(`(${rowPlaceholders.join(", ")})`);
    }

    const sql = `INSERT INTO public."${tableName}" (${colNames}) VALUES ${valuesSql.join(", ")}`;
    await client.query(sql, params);
    insertedCount += chunk.length;
  }

  return insertedCount;
}

async function migrateStorageBucket(bucketName) {
  console.log(`\n[STORAGE] Migrating bucket '${bucketName}'...`);
  const targetDir = path.join(uploadsDir, bucketName);
  await mkdir(targetDir, { recursive: true });

  let fileCount = 0;

  async function listAndDownload(folderPath = "") {
    const { data: items, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, { limit: 1000 });

    if (error) {
      console.warn(`[STORAGE] Error listing folder '${folderPath}':`, error.message);
      return;
    }

    for (const item of items) {
      const itemPath = folderPath ? `${folderPath}/${item.name}` : item.name;
      if (!item.id && !item.metadata?.size) {
        await listAndDownload(itemPath);
      } else {
        const { data: fileData, error: downloadErr } = await supabase.storage
          .from(bucketName)
          .download(itemPath);

        if (downloadErr) {
          console.warn(`[STORAGE] Failed to download '${itemPath}':`, downloadErr.message);
        } else if (fileData) {
          const buffer = Buffer.from(await fileData.arrayBuffer());
          const destPath = path.join(targetDir, itemPath);
          await mkdir(path.dirname(destPath), { recursive: true });
          await writeFile(destPath, buffer);
          fileCount++;
        }
      }
    }
  }

  await listAndDownload();
  console.log(`[STORAGE] Downloaded ${fileCount} files for '${bucketName}' to ${targetDir}`);
}

async function main() {
  const client = await pgPool.connect();
  try {
    // Temporarily disable foreign key constraints during bulk migration
    await client.query("SET session_replication_role = 'replica';");

    const { rows: pgTables } = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name != '_schema_migrations'
      ORDER BY table_name;
    `);

    const tableNames = pgTables.map((r) => r.table_name);
    console.log(`\n[DATABASE] Found ${tableNames.length} target tables in Railway Postgres.`);

    for (const table of tableNames) {
      process.stdout.write(`Fetching '${table}' from Supabase... `);
      const rows = await getAllRows(table);

      if (rows === null) {
        console.log(`(Not on Supabase - Skipped)`);
        continue;
      }

      if (rows.length === 0) {
        console.log(`(0 rows)`);
        continue;
      }

      process.stdout.write(`Found ${rows.length} rows. Importing to Railway... `);
      const inserted = await insertRowsToPg(client, table, rows);
      console.log(`DONE (${inserted} rows inserted)`);
    }

    // Reset sequences for auto-increment columns (serial / bigserial)
    const { rows: sequences } = await client.query(`
      SELECT table_name, column_name, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND column_default LIKE 'nextval%'
    `);

    console.log("\n[SEQUENCES] Resetting auto-increment sequences...");
    for (const seq of sequences) {
      const match = seq.column_default.match(/nextval\('([^']+)'/);
      if (match && match[1]) {
        const seqName = match[1];
        try {
          await client.query(`
            SELECT setval($1, COALESCE((SELECT MAX("${seq.column_name}") FROM public."${seq.table_name}"), 1), true)
          `, [seqName]);
          console.log(`[SEQUENCE] ${seq.table_name}.${seq.column_name} -> ${seqName} updated.`);
        } catch (e) {
          console.warn(`[SEQUENCE] Warning resetting ${seqName}:`, e.message);
        }
      }
    }

    // Re-enable foreign key constraints
    await client.query("SET session_replication_role = 'origin';");

    // Storage Migration
    console.log("\n==========================================");
    console.log("  SUPABASE STORAGE -> RAILWAY VOLUME");
    console.log("==========================================");

    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) {
      console.warn("Could not list buckets:", bErr.message);
    } else if (buckets) {
      for (const bucket of buckets) {
        await migrateStorageBucket(bucket.name);
      }
    }

    console.log("\n==========================================");
    console.log("  ✅ FULL MIGRATION COMPLETED SUCCESSFULLY!");
    console.log("==========================================");
  } finally {
    try {
      await client.query("SET session_replication_role = 'origin';");
    } catch {}
    client.release();
    await pgPool.end();
  }
}

main().catch((err) => {
  console.error("\n❌ Migration failed:", err);
  process.exit(1);
});
