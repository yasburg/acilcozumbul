#!/usr/bin/env node
/**
 * Yerel data/*.json dosyalarını Supabase'e aktarır.
 * Önce supabase/migrations/001_initial.sql çalıştırın.
 *
 * Kullanım: node --env-file=.env scripts/migrate-json-to-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const dataDir = path.join(process.cwd(), "data");

async function readJson(name, fallback) {
  try {
    const raw = await readFile(path.join(dataDir, name), "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function cekiciToRow(c) {
  return {
    id: c.id,
    ad: c.ad,
    telefon: c.telefon,
    token: c.token,
    sifre: c.sifre,
    kredi: c.kredi ?? 0,
    sehir: c.sehir,
    hizmet_ilceleri: c.hizmetIlceleri ?? [],
    aktif: c.aktif ?? true,
    kayit_tarihi: c.kayitTarihi ?? new Date().toISOString(),
  };
}

function talepToRow(t) {
  return {
    id: t.id,
    ad: t.ad,
    soyad: t.soyad,
    telefon: t.telefon,
    konum: t.konum,
    konum_il: t.konumIl ?? null,
    konum_ilce: t.konumIlce ?? null,
    hedef_konum: t.hedefKonum ?? null,
    sorun: t.sorun,
    sorun_tipi: t.sorunTipi ?? null,
    sorun_detay: t.sorunDetay ?? null,
    durum: t.durum,
    olusturulma: t.olusturulma,
    ihale_bitis: t.ihaleBitis,
    kazanan_cekici_id: t.kazananCekiciId ?? null,
    kazanan_teklif_id: t.kazananTeklifId ?? null,
    bildirilen_cekici_ids: t.bildirilenCekiciIds ?? [],
    anlasma_durumu: t.anlasmaDurumu ?? null,
    haric_tutulan_cekici_ids: t.haricTutulanCekiciIds ?? [],
    teklifler: t.teklifler ?? [],
  };
}

async function upsertBatch(table, rows, onConflict = "id") {
  if (!rows.length) return;
  const chunk = 100;
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const { error } = await supabase.from(table).upsert(slice, { onConflict });
    if (error) {
      const hint =
        error.message?.includes("permission denied") &&
        " — Supabase SQL Editor'da supabase/migrations/002_grants.sql çalıştırın; .env'de service_role key olduğundan emin olun.";
      throw new Error(`${table}: ${error.message}${hint ?? ""}`);
    }
    console.log(`  ${table}: ${Math.min(i + chunk, rows.length)} / ${rows.length}`);
  }
}

async function main() {
  const cekiciler = await readJson("cekiciler.json", []);
  const talepler = await readJson("talepler.json", []);
  const smsLog = await readJson("sms-log.json", []);
  const otpList = await readJson("telefon-otp.json", []);
  const odemeler = await readJson("odeme-bekleyen.json", []);

  console.log("Çekiciler:", cekiciler.length);
  await upsertBatch("cekiciler", cekiciler.map(cekiciToRow));

  console.log("Talepler:", talepler.length);
  await upsertBatch("talepler", talepler.map(talepToRow));

  console.log("SMS log:", smsLog.length);
  await upsertBatch(
    "sms_log",
    smsLog.map((s) => ({
      id: s.id,
      cekici_id: s.cekiciId,
      cekici_telefon: s.cekiciTelefon,
      mesaj: s.mesaj,
      link: s.link ?? "",
      talep_id: s.talepId ?? "",
      gonderim: s.gonderim,
      alici_tipi: s.aliciTipi ?? null,
      gonderildi: s.gonderildi ?? false,
      saglayici: s.saglayici ?? null,
    }))
  );

  console.log("OTP:", otpList.length);
  await upsertBatch(
    "telefon_otp",
    otpList.map((k) => ({
      telefon: k.telefon,
      kod: k.kod,
      olusturulma: k.olusturulma,
      son_gonderim: k.sonGonderim,
      deneme: k.deneme ?? 0,
      dogrulandi: k.dogrulandi ?? false,
    })),
    "telefon"
  );

  console.log("Ödemeler:", odemeler.length);
  await upsertBatch(
    "odeme_bekleyen",
    odemeler.map((o) => ({
      id: o.id,
      cekici_id: o.cekiciId,
      miktar: o.miktar,
      tutar: o.tutar,
      olusturulma: o.olusturulma,
      durum: o.durum,
    }))
  );

  console.log("Tamamlandı.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
