#!/usr/bin/env node
/**
 * cekiciler.sifre (plaintext) → sifre_hash, ardından sifre = null.
 * Aynı şifreyle giriş çalışmaya devam eder; düz metin DB'de kalmaz.
 */
import pg from "pg";
import { sifreHashle, sifreHashMi } from "./sifre-hash.mjs";

export async function hashleCekiciPlaintext(client) {
  const { rows: kolon } = await client.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'cekiciler'
       AND column_name = 'sifre_hash'
     LIMIT 1`
  );
  if (kolon.length === 0) {
    console.warn(
      "[HASH] sifre_hash kolonu yok; önce 067_cekici_sifre_hash.sql uygulayın."
    );
    return { hashlenen: 0, silinen: 0 };
  }

  const { rows } = await client.query(
    `SELECT id, sifre
     FROM public.cekiciler
     WHERE sifre IS NOT NULL
       AND btrim(sifre) <> ''
       AND (sifre_hash IS NULL OR btrim(sifre_hash) = '')`
  );

  let hashlenen = 0;
  for (const row of rows) {
    const ham = String(row.sifre);
    const hash = sifreHashMi(ham) ? ham : sifreHashle(ham);
    await client.query(
      `UPDATE public.cekiciler
       SET sifre_hash = $1, sifre = NULL
       WHERE id = $2`,
      [hash, row.id]
    );
    hashlenen += 1;
  }

  const silinen = await client.query(
    `UPDATE public.cekiciler
     SET sifre = NULL
     WHERE sifre IS NOT NULL
       AND btrim(sifre) <> ''
       AND sifre_hash IS NOT NULL
       AND btrim(sifre_hash) <> ''`
  );

  const silinenSayi = silinen.rowCount ?? 0;
  console.log(
    `[HASH] ${hashlenen} plaintext → sifre_hash; ${silinenSayi} artık hash'li satırda sifre silindi.`
  );
  return { hashlenen, silinen: silinenSayi };
}

function sslAyar(dbUrl) {
  if (dbUrl.includes("proxy.rlwy.net")) return { rejectUnauthorized: false };
  if (
    dbUrl.includes("localhost") ||
    dbUrl.includes("127.0.0.1") ||
    dbUrl.includes(".railway.internal")
  ) {
    return false;
  }
  return { rejectUnauthorized: false };
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL or POSTGRES_URL is required.");
    process.exit(1);
  }

  const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: sslAyar(dbUrl),
  });
  const client = await pool.connect();
  try {
    await hashleCekiciPlaintext(client);
  } finally {
    client.release();
    await pool.end();
  }
}

const buDosya = process.argv[1] ?? "";
if (buDosya.endsWith("hash-cekici-plaintext.mjs")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
