#!/usr/bin/env node
/**
 * Teklif / bildirim backfill doğrulama.
 * Kullanım: node --env-file=.env.local scripts/verify-teklif-backfill.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE url / service role key gerekli");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { count: teklifCount, error: tErr } = await sb
    .from("teklifler")
    .select("*", { count: "exact", head: true });
  if (tErr) throw tErr;

  const { data: talepler, error } = await sb
    .from("talepler")
    .select("id, teklifler, bildirilen_cekici_ids, haric_tutulan_cekici_ids");
  if (error) {
    // Kolonlar drop edilmiş olabilir — sadece tablo sayıları
    console.log("talepler JSON kolonları yok (drop sonrası). teklifler satır:", teklifCount);
    const { count: b } = await sb
      .from("talep_bildirimleri")
      .select("*", { count: "exact", head: true });
    const { count: h } = await sb
      .from("talep_haric")
      .select("*", { count: "exact", head: true });
    console.log("talep_bildirimleri:", b, "talep_haric:", h);
    return;
  }

  let jsonTeklif = 0;
  let jsonBildirim = 0;
  let jsonHaric = 0;
  for (const t of talepler ?? []) {
    jsonTeklif += Array.isArray(t.teklifler) ? t.teklifler.length : 0;
    jsonBildirim += Array.isArray(t.bildirilen_cekici_ids)
      ? t.bildirilen_cekici_ids.length
      : 0;
    jsonHaric += Array.isArray(t.haric_tutulan_cekici_ids)
      ? t.haric_tutulan_cekici_ids.length
      : 0;
  }

  const { count: bildirimCount } = await sb
    .from("talep_bildirimleri")
    .select("*", { count: "exact", head: true });
  const { count: haricCount } = await sb
    .from("talep_haric")
    .select("*", { count: "exact", head: true });

  console.log({
    jsonTeklif,
    tabloTeklif: teklifCount,
    teklifMatch: jsonTeklif === teklifCount,
    jsonBildirim,
    tabloBildirim: bildirimCount,
    bildirimMatch: jsonBildirim === bildirimCount,
    jsonHaric,
    tabloHaric: haricCount,
    haricMatch: jsonHaric === haricCount,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
