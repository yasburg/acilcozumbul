#!/usr/bin/env node
/**
 * Supabase Auth bcrypt hash'lerini Railway cekiciler.sifre_hash'e taşır.
 *
 * API hash vermez; auth.users.encrypted_password Postgres'te durur.
 *
 * 1) Supabase Dashboard → Project Settings → Database → URI
 *    SUPABASE_DB_URL=postgresql://postgres:...@.../postgres
 *
 *    node --env-file=.env scripts/migrate-auth-hashes-from-supabase.mjs
 *
 * 2) veya SQL Editor'da kaydet → JSON:
 *
 *    SELECT id::text AS id,
 *           email,
 *           encrypted_password,
 *           raw_user_meta_data->>'cekici_id' AS cekici_id
 *    FROM auth.users
 *    WHERE encrypted_password IS NOT NULL AND encrypted_password <> '';
 *
 *    node --env-file=.env scripts/migrate-auth-hashes-from-supabase.mjs --from-json auth-users.json
 *
 * Railway DATABASE_URL gerekir. 067 kolonu yoksa eklenir.
 * Girişte bcrypt doğrulanır, sonra scrypt'e çevrilir.
 */
import { readFile } from "fs/promises";
import pg from "pg";

function sslAyar(dbUrl) {
  if (dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1")) return false;
  return { rejectUnauthorized: false };
}

function bcryptMi(deger) {
  if (!deger || typeof deger !== "string") return false;
  const ham = deger.startsWith("bcrypt$") ? deger.slice(7) : deger;
  return /^\$2[aby]\$\d{2}\$/.test(ham);
}

function jsonDosyaYolu() {
  const i = process.argv.indexOf("--from-json");
  if (i === -1) return null;
  return process.argv[i + 1] ?? null;
}

async function supabaseAuthKullanicilari(jsonPath) {
  if (jsonPath) {
    const ham = JSON.parse(await readFile(jsonPath, "utf-8"));
    const rows = Array.isArray(ham) ? ham : ham.rows ?? ham.data ?? [];
    return rows.map((r) => ({
      id: String(r.id ?? ""),
      email: String(r.email ?? "").toLowerCase(),
      encrypted_password: String(r.encrypted_password ?? r.encryptedPassword ?? ""),
      cekici_id: r.cekici_id ? String(r.cekici_id) : null,
    }));
  }

  const supabaseDb =
    process.env.SUPABASE_DB_URL?.trim() ||
    process.env.SUPABASE_DATABASE_URL?.trim();
  if (!supabaseDb) {
    console.error(
      "SUPABASE_DB_URL veya --from-json dosyası gerekli.\n" +
        "Service role / REST hash vermez; Database URI kullanın."
    );
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString: supabaseDb,
    ssl: sslAyar(supabaseDb),
  });
  try {
    const { rows } = await pool.query(`
      SELECT id::text AS id,
             lower(email) AS email,
             encrypted_password,
             raw_user_meta_data->>'cekici_id' AS cekici_id
      FROM auth.users
      WHERE encrypted_password IS NOT NULL
        AND encrypted_password <> ''
    `);
    return rows;
  } finally {
    await pool.end();
  }
}

async function main() {
  const railwayUrl =
    process.env.DATABASE_URL?.trim() || process.env.POSTGRES_URL?.trim();
  if (!railwayUrl) {
    console.error("DATABASE_URL or POSTGRES_URL is required.");
    process.exit(1);
  }

  const authUsers = await supabaseAuthKullanicilari(jsonDosyaYolu());
  const bcryptUsers = authUsers.filter((u) => bcryptMi(u.encrypted_password));
  console.log(
    `[AUTH] ${authUsers.length} kullanıcı, ${bcryptUsers.length} bcrypt hash.`
  );

  const pool = new pg.Pool({
    connectionString: railwayUrl,
    ssl: sslAyar(railwayUrl),
  });
  const client = await pool.connect();
  try {
    await client.query(
      `ALTER TABLE public.cekiciler ADD COLUMN IF NOT EXISTS sifre_hash text`
    );

    const { rows: cekiciler } = await client.query(
      `SELECT id, telefon, auth_user_id::text AS auth_user_id, sifre_hash
       FROM public.cekiciler`
    );

    const byId = new Map(cekiciler.map((c) => [String(c.id), c]));
    const byAuth = new Map(
      cekiciler
        .filter((c) => c.auth_user_id)
        .map((c) => [String(c.auth_user_id), c])
    );
    const byEmail = new Map();
    for (const c of cekiciler) {
      const tel = String(c.telefon ?? "").replace(/\D/g, "");
      let n = tel;
      if (n.startsWith("90") && n.length === 12) n = "0" + n.slice(2);
      if (n.length === 10 && n.startsWith("5")) n = "0" + n;
      byEmail.set(`${n}@cekici.acilcozumbul.internal`, c);
    }

    let yazilan = 0;
    let atlanan = 0;
    let eslesmeyen = 0;

    for (const u of bcryptUsers) {
      const cekici =
        (u.cekici_id && byId.get(u.cekici_id)) ||
        (u.id && byAuth.get(u.id)) ||
        (u.email && byEmail.get(u.email)) ||
        null;
      if (!cekici) {
        eslesmeyen += 1;
        continue;
      }
      const mevcut = cekici.sifre_hash ? String(cekici.sifre_hash) : "";
      if (mevcut.startsWith("scrypt$")) {
        atlanan += 1;
        continue;
      }
      await client.query(
        `UPDATE public.cekiciler
         SET sifre_hash = $1, sifre = NULL
         WHERE id = $2`,
        [u.encrypted_password, cekici.id]
      );
      cekici.sifre_hash = u.encrypted_password;
      yazilan += 1;
    }

    console.log(
      `[AUTH] yazılan=${yazilan} atlanan(scrypt)=${atlanan} eşleşmeyen=${eslesmeyen}`
    );
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
