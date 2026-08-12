import { getSupabaseAdmin } from "./supabase/admin";

export async function listBildirilenCekiciIds(talepId: string): Promise<string[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("talep_bildirimleri")
    .select("cekici_id")
    .eq("talep_id", talepId);
  if (error) throw error;
  return (data ?? []).map((r: { cekici_id: string }) => r.cekici_id);
}

export async function listHaricCekiciIds(talepId: string): Promise<string[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("talep_haric")
    .select("cekici_id")
    .eq("talep_id", talepId);
  if (error) throw error;
  return (data ?? []).map((r: { cekici_id: string }) => r.cekici_id);
}

/** PostgREST `.in()` URL limiti — çok ID tek istekte `fetch failed` verir. */
const ILISKI_IN_CHUNK = 100;

export async function hydrateTalepIliskileri(
  talepIds: string[]
): Promise<{
  bildirilen: Map<string, string[]>;
  haric: Map<string, string[]>;
}> {
  const bildirilen = new Map<string, string[]>();
  const haric = new Map<string, string[]>();
  if (talepIds.length === 0) return { bildirilen, haric };

  const sb = getSupabaseAdmin();
  for (let i = 0; i < talepIds.length; i += ILISKI_IN_CHUNK) {
    const parti = talepIds.slice(i, i + ILISKI_IN_CHUNK);
    const [bRes, hRes] = await Promise.all([
      sb
        .from("talep_bildirimleri")
        .select("talep_id, cekici_id")
        .in("talep_id", parti),
      sb.from("talep_haric").select("talep_id, cekici_id").in("talep_id", parti),
    ]);
    if (bRes.error) throw bRes.error;
    if (hRes.error) throw hRes.error;

    for (const r of bRes.data ?? []) {
      const list = bildirilen.get(r.talep_id) ?? [];
      list.push(r.cekici_id);
      bildirilen.set(r.talep_id, list);
    }
    for (const r of hRes.data ?? []) {
      const list = haric.get(r.talep_id) ?? [];
      list.push(r.cekici_id);
      haric.set(r.talep_id, list);
    }
  }
  return { bildirilen, haric };
}

export async function syncBildirilenCekiciler(
  talepId: string,
  cekiciIds: string[]
): Promise<void> {
  const unique = [...new Set(cekiciIds.filter(Boolean))];
  if (unique.length === 0) return;
  const { error } = await getSupabaseAdmin().from("talep_bildirimleri").upsert(
    unique.map((cekici_id) => ({
      talep_id: talepId,
      cekici_id,
    })),
    { onConflict: "talep_id,cekici_id", ignoreDuplicates: true }
  );
  if (error) throw error;
}

export async function addBildirilenCekici(
  talepId: string,
  cekiciId: string
): Promise<void> {
  await syncBildirilenCekiciler(talepId, [cekiciId]);
}

export async function syncHaricCekiciler(
  talepId: string,
  cekiciIds: string[]
): Promise<void> {
  const unique = [...new Set(cekiciIds.filter(Boolean))];
  if (unique.length === 0) return;
  const { error } = await getSupabaseAdmin().from("talep_haric").upsert(
    unique.map((cekici_id) => ({
      talep_id: talepId,
      cekici_id,
    })),
    { onConflict: "talep_id,cekici_id", ignoreDuplicates: true }
  );
  if (error) throw error;
}

export async function countHaricByCekici(cekiciId: string): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("talep_haric")
    .select("*", { count: "exact", head: true })
    .eq("cekici_id", cekiciId);
  if (error) throw error;
  return count ?? 0;
}
