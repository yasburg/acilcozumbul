import { getSupabaseAdmin } from "./supabase/admin";
import { telefonNormalize } from "./telefon";
import { getSms50TokenOzetByTelefonlar } from "./sms50-token";

export type TopluSmsListeOzet = {
  id: string;
  olusturulma: string;
  gonderenEposta: string | null;
  mesaj: string;
  aliciSayisi: number;
  basarili: number;
  basarisiz: number;
  mesajParca: number | null;
  kampanyaKodu: string | null;
  varyant: string | null;
};

export type TopluSmsListeAlici = {
  telefon: string;
  ad: string | null;
  basarili: boolean;
  hata: string | null;
};

export type TopluSmsGenelTelefon = {
  telefon: string;
  ad: string | null;
  ilkGonderim: string;
  sonGonderim: string;
  gonderimSayisi: number;
  basariliSayisi: number;
  /** Token’lı gönderimde SMS50 harfi (a–z); yoksa null */
  varyant: string | null;
  /** Token’lı gönderim varsa: link açıldı mı; yoksa null (—) */
  linkActi: boolean | null;
  ilkTiklama: string | null;
  /** Token kaydı veya cekiciler eşleşmesi */
  kayitli: boolean;
  kayitAt: string | null;
};

const IN_CHUNK = 200;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Genel defterde kayıtlı (daha önce toplu SMS gönderilmiş) numaralar */
export async function topluSmsOncekiTelefonlariBul(
  telefonlar: string[]
): Promise<Set<string>> {
  const benzersiz = [
    ...new Set(
      telefonlar.map((t) => telefonNormalize(t)).filter((t) => t.length >= 10)
    ),
  ];
  const bulunan = new Set<string>();
  if (benzersiz.length === 0) return bulunan;

  const sb = getSupabaseAdmin();
  for (const parti of chunk(benzersiz, IN_CHUNK)) {
    const { data, error } = await sb
      .from("panel_toplu_sms_telefonlar")
      .select("telefon")
      .in("telefon", parti);
    if (error) throw error;
    for (const row of data ?? []) {
      if (row.telefon) bulunan.add(String(row.telefon));
    }
  }
  return bulunan;
}

async function genelDeftereYaz(
  listeId: string,
  alicilar: Array<{
    telefon: string;
    ad?: string | null;
    basarili: boolean;
  }>
) {
  const sb = getSupabaseAdmin();
  const now = new Date().toISOString();

  for (const parti of chunk(alicilar, IN_CHUNK)) {
    const telefonlar = parti.map((a) => a.telefon);
    const { data: mevcut } = await sb
      .from("panel_toplu_sms_telefonlar")
      .select("telefon, ad, gonderim_sayisi, basarili_sayisi")
      .in("telefon", telefonlar);

    const mevcutMap = new Map(
      (mevcut ?? []).map((r) => [
        String(r.telefon),
        {
          ad: r.ad as string | null,
          gonderim_sayisi: Number(r.gonderim_sayisi) || 0,
          basarili_sayisi: Number(r.basarili_sayisi) || 0,
        },
      ])
    );

    const upsertRows = parti.map((a) => {
      const onceki = mevcutMap.get(a.telefon);
      return {
        telefon: a.telefon,
        ad: a.ad?.trim() || onceki?.ad || null,
        gonderim_sayisi: (onceki?.gonderim_sayisi ?? 0) + 1,
        basarili_sayisi:
          (onceki?.basarili_sayisi ?? 0) + (a.basarili ? 1 : 0),
      };
    });

    const yeni = upsertRows.filter((r) => !mevcutMap.has(r.telefon));
    const guncelle = upsertRows.filter((r) => mevcutMap.has(r.telefon));

    if (yeni.length > 0) {
      const { error } = await sb.from("panel_toplu_sms_telefonlar").insert(
        yeni.map((r) => ({
          telefon: r.telefon,
          ad: r.ad,
          ilk_gonderim: now,
          son_gonderim: now,
          gonderim_sayisi: r.gonderim_sayisi,
          basarili_sayisi: r.basarili_sayisi,
          son_liste_id: listeId,
        }))
      );
      if (error) throw error;
    }

    for (const r of guncelle) {
      const { error } = await sb
        .from("panel_toplu_sms_telefonlar")
        .update({
          ad: r.ad,
          son_gonderim: now,
          gonderim_sayisi: r.gonderim_sayisi,
          basarili_sayisi: r.basarili_sayisi,
          son_liste_id: listeId,
        })
        .eq("telefon", r.telefon);
      if (error) throw error;
    }
  }
}

/** Boş geçmiş listesi (arka plan işi başında) */
export async function baslatTopluSmsGecmisListe(opts: {
  gonderenEposta?: string | null;
  mesaj: string;
  mesajParca?: number;
  mesajBirim?: number;
  kampanyaKodu?: string | null;
  varyant?: string | null;
  aliciSayisi: number;
}): Promise<{ listeId: string }> {
  const { data: liste, error } = await getSupabaseAdmin()
    .from("panel_toplu_sms_listeler")
    .insert({
      gonderen_eposta: opts.gonderenEposta ?? null,
      mesaj: opts.mesaj,
      alici_sayisi: opts.aliciSayisi,
      basarili: 0,
      basarisiz: 0,
      mesaj_parca: opts.mesajParca ?? null,
      mesaj_birim: opts.mesajBirim ?? null,
      kampanya_kodu: opts.kampanyaKodu ?? null,
      varyant: opts.varyant ?? null,
    })
    .select("id")
    .single();
  if (error || !liste?.id) {
    throw error ?? new Error("Liste kaydı oluşturulamadı.");
  }
  return { listeId: String(liste.id) };
}

/** Parti sonucunu mevcut listeye ekler */
export async function ekleTopluSmsGecmisAlicilar(
  listeId: string,
  alicilarHam: Array<{
    telefon: string;
    ad?: string | null;
    basarili: boolean;
    hata?: string | null;
  }>
): Promise<void> {
  const sb = getSupabaseAdmin();
  const alicilar = alicilarHam.map((a) => ({
    ...a,
    telefon: telefonNormalize(a.telefon),
  }));
  if (alicilar.length === 0) return;

  const { error: aliciErr } = await sb.from("panel_toplu_sms_liste_alicilar").insert(
    alicilar.map((a) => ({
      liste_id: listeId,
      telefon: a.telefon,
      ad: a.ad?.trim() || null,
      basarili: a.basarili,
      hata: a.hata ?? null,
    }))
  );
  if (aliciErr) throw aliciErr;

  const ekBasarili = alicilar.filter((a) => a.basarili).length;
  const ekBasarisiz = alicilar.length - ekBasarili;
  const { data: mevcut, error: okuErr } = await sb
    .from("panel_toplu_sms_listeler")
    .select("basarili, basarisiz")
    .eq("id", listeId)
    .single();
  if (okuErr) throw okuErr;

  const { error: guncelleErr } = await sb
    .from("panel_toplu_sms_listeler")
    .update({
      basarili: (Number(mevcut?.basarili) || 0) + ekBasarili,
      basarisiz: (Number(mevcut?.basarisiz) || 0) + ekBasarisiz,
    })
    .eq("id", listeId);
  if (guncelleErr) throw guncelleErr;

  await genelDeftereYaz(listeId, alicilar);
}

export async function kaydetTopluSmsGecmis(opts: {
  gonderenEposta?: string | null;
  mesaj: string;
  mesajParca?: number;
  mesajBirim?: number;
  kampanyaKodu?: string | null;
  varyant?: string | null;
  alicilar: Array<{
    telefon: string;
    ad?: string | null;
    basarili: boolean;
    hata?: string | null;
  }>;
}): Promise<{ listeId: string }> {
  const alicilar = opts.alicilar.map((a) => ({
    ...a,
    telefon: telefonNormalize(a.telefon),
  }));
  const { listeId } = await baslatTopluSmsGecmisListe({
    gonderenEposta: opts.gonderenEposta,
    mesaj: opts.mesaj,
    mesajParca: opts.mesajParca,
    mesajBirim: opts.mesajBirim,
    kampanyaKodu: opts.kampanyaKodu,
    varyant: opts.varyant,
    aliciSayisi: alicilar.length,
  });
  await ekleTopluSmsGecmisAlicilar(listeId, alicilar);
  return { listeId };
}

export async function getTopluSmsListeler(
  limit = 50
): Promise<TopluSmsListeOzet[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("panel_toplu_sms_listeler")
    .select(
      "id, olusturulma, gonderen_eposta, mesaj, alici_sayisi, basarili, basarisiz, mesaj_parca, kampanya_kodu, varyant"
    )
    .order("olusturulma", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: String(r.id),
    olusturulma: String(r.olusturulma),
    gonderenEposta: r.gonderen_eposta ? String(r.gonderen_eposta) : null,
    mesaj: String(r.mesaj ?? ""),
    aliciSayisi: Number(r.alici_sayisi) || 0,
    basarili: Number(r.basarili) || 0,
    basarisiz: Number(r.basarisiz) || 0,
    mesajParca: r.mesaj_parca != null ? Number(r.mesaj_parca) : null,
    kampanyaKodu: r.kampanya_kodu ? String(r.kampanya_kodu) : null,
    varyant: r.varyant ? String(r.varyant) : null,
  }));
}

export async function getTopluSmsListeAlicilar(
  listeId: string
): Promise<TopluSmsListeAlici[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("panel_toplu_sms_liste_alicilar")
    .select("telefon, ad, basarili, hata")
    .eq("liste_id", listeId)
    .order("telefon");
  if (error) throw error;
  return (data ?? []).map((r) => ({
    telefon: String(r.telefon),
    ad: r.ad ? String(r.ad) : null,
    basarili: Boolean(r.basarili),
    hata: r.hata ? String(r.hata) : null,
  }));
}

export async function getTopluSmsGenelTelefonlar(
  limit = 500
): Promise<TopluSmsGenelTelefon[]> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("panel_toplu_sms_telefonlar")
    .select(
      "telefon, ad, ilk_gonderim, son_gonderim, gonderim_sayisi, basarili_sayisi"
    )
    .order("son_gonderim", { ascending: false })
    .limit(limit);
  if (error) throw error;

  const rows = data ?? [];
  const telefonlar = rows.map((r) => String(r.telefon));
  const tokenMap = await getSms50TokenOzetByTelefonlar(telefonlar);

  const kayitliSet = new Set<string>();
  for (let i = 0; i < telefonlar.length; i += IN_CHUNK) {
    const parti = telefonlar.slice(i, i + IN_CHUNK);
    const { data: cekiciler } = await sb
      .from("cekiciler")
      .select("telefon")
      .in("telefon", parti);
    for (const c of cekiciler ?? []) {
      if (c.telefon) kayitliSet.add(String(c.telefon));
    }
  }

  return rows.map((r) => {
    const telefon = String(r.telefon);
    const token = tokenMap.get(telefon);
    const kayitAt = token?.kayitAt ?? null;
    const kayitli = Boolean(kayitAt) || kayitliSet.has(telefon);
    return {
      telefon,
      ad: r.ad ? String(r.ad) : null,
      ilkGonderim: String(r.ilk_gonderim),
      sonGonderim: String(r.son_gonderim),
      gonderimSayisi: Number(r.gonderim_sayisi) || 0,
      basariliSayisi: Number(r.basarili_sayisi) || 0,
      varyant: token?.varyant ?? null,
      linkActi: token ? token.linkActi : null,
      ilkTiklama: token?.ilkTiklama ?? null,
      kayitli,
      kayitAt,
    };
  });
}
