#!/usr/bin/env node
import pg from "pg";
import { readFile } from "fs/promises";
import path from "path";

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error("DATABASE_URL or POSTGRES_URL is required.");
  process.exit(1);
}

console.log("Connecting to Railway Postgres for Data Import...");
const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: dbUrl.includes("proxy.rlwy.net")
    ? { rejectUnauthorized: false }
    : dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") || dbUrl.includes(".railway.internal")
    ? false
    : { rejectUnauthorized: false },
});

const dataDir = path.join(process.cwd(), "data");

async function readJson(name, fallback = []) {
  try {
    const raw = await readFile(path.join(dataDir, name), "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function main() {
  const client = await pool.connect();
  try {
    const cekiciler = await readJson("cekiciler.json", []);
    const talepler = await readJson("talepler.json", []);
    const smsLog = await readJson("sms-log.json", []);
    const otpList = await readJson("telefon-otp.json", []);
    const odemeler = await readJson("odeme-bekleyen.json", []);

    console.log(`Importing ${cekiciler.length} çekiciler...`);
    for (const c of cekiciler) {
      await client.query(
        `INSERT INTO public.cekiciler (id, ad, telefon, token, sifre, kredi, sehir, hizmet_ilceleri, aktif, kayit_tarihi)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           ad = EXCLUDED.ad, telefon = EXCLUDED.telefon, token = EXCLUDED.token,
           sifre = EXCLUDED.sifre, kredi = EXCLUDED.kredi, sehir = EXCLUDED.sehir,
           hizmet_ilceleri = EXCLUDED.hizmet_ilceleri, aktif = EXCLUDED.aktif;`,
        [
          c.id,
          c.ad,
          c.telefon,
          c.token,
          c.sifre ?? "",
          c.kredi ?? 0,
          c.sehir,
          c.hizmetIlceleri ?? [],
          c.aktif ?? true,
          c.kayitTarihi ?? new Date().toISOString(),
        ]
      );
    }

    console.log(`Importing ${talepler.length} talepler...`);
    for (const t of talepler) {
      await client.query(
        `INSERT INTO public.talepler (id, ad, soyad, telefon, konum, konum_il, konum_ilce, hedef_konum, sorun, sorun_tipi, sorun_detay, durum, olusturulma, ihale_bitis, kazanan_cekici_id, kazanan_teklif_id, anlasma_durumu)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (id) DO UPDATE SET durum = EXCLUDED.durum;`,
        [
          t.id,
          t.ad,
          t.soyad,
          t.telefon,
          JSON.stringify(t.konum),
          t.konumIl ?? null,
          t.konumIlce ?? null,
          t.hedefKonum ? JSON.stringify(t.hedefKonum) : null,
          t.sorun,
          t.sorunTipi ?? null,
          t.sorunDetay ?? null,
          t.durum,
          t.olusturulma,
          t.ihaleBitis,
          t.kazananCekiciId ?? null,
          t.kazananTeklifId ?? null,
          t.anlasmaDurumu ?? null,
        ]
      );
    }

    console.log(`Importing ${smsLog.length} SMS logs...`);
    for (const s of smsLog) {
      await client.query(
        `INSERT INTO public.sms_log (id, cekici_id, cekici_telefon, mesaj, link, talep_id, gonderim, alici_tipi, gonderildi, saglayici)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING;`,
        [
          s.id,
          s.cekiciId,
          s.cekiciTelefon,
          s.mesaj,
          s.link ?? "",
          s.talepId ?? "",
          s.gonderim ?? new Date().toISOString(),
          s.aliciTipi ?? null,
          s.gonderildi ?? false,
          s.saglayici ?? null,
        ]
      );
    }

    console.log(`Importing ${otpList.length} OTPs...`);
    for (const k of otpList) {
      await client.query(
        `INSERT INTO public.telefon_otp (telefon, kod, olusturulma, son_gonderim, deneme, dogrulandi)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (telefon) DO NOTHING;`,
        [
          k.telefon,
          k.kod,
          k.olusturulma,
          k.sonGonderim,
          k.deneme ?? 0,
          k.dogrulandi ?? false,
        ]
      );
    }

    console.log("✅ Data import to Railway Postgres complete!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Data import failed:", err);
  process.exit(1);
});
