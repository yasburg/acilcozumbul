import { sendPanelTopluSms } from "./sms-provider";
import {
  baslatTopluSmsGecmisListe,
  ekleTopluSmsGecmisAlicilar,
} from "./toplu-sms-gecmis-db";
import {
  topluSmsPartiBeklemeMs,
  topluSmsPartilereBol,
  topluSmsTempoNormalize,
  type TopluSmsTempo,
} from "./toplu-sms-tempo";
import { getSupabaseAdmin } from "./supabase/admin";
import { telefonNormalize } from "./telefon";
import {
  sms50MesajOlustur,
  sms50VaryantMi,
  type Sms50Varyant,
} from "./sms50-kampanya";
import { olusturSms50LinkToken } from "./sms50-token";
import { smsBaseUrl } from "./sms-base-url";
export type TopluSmsIsDurum =
  | "beklemede"
  | "suruyor"
  | "bitti"
  | "iptal"
  | "hata";

export type TopluSmsIsOzet = {
  id: string;
  olusturulma: string;
  guncelleme: string;
  gonderenEposta: string | null;
  mesaj: string;
  mesajParca: number | null;
  mesajBirim: number | null;
  kampanyaKodu: string | null;
  varyant: string | null;
  durum: TopluSmsIsDurum;
  partiBoyutu: number;
  beklemeSn: number;
  jitterOran: number;
  partiIndex: number;
  partiToplam: number;
  basarili: number;
  basarisiz: number;
  oncekiAtlandi: number;
  sonrakiPartiAt: string | null;
  listeId: string | null;
  hata: string | null;
  aliciSayisi: number;
  kalanSn: number | null;
  kisiBazliTakip: boolean;
};

type IsRow = {
  id: string;
  olusturulma: string;
  guncelleme: string;
  gonderen_eposta: string | null;
  mesaj: string;
  mesaj_parca: number | null;
  mesaj_birim: number | null;
  kampanya_kodu: string | null;
  varyant: string | null;
  durum: string;
  parti_boyutu: number;
  bekleme_sn: number;
  jitter_oran: number;
  parti_index: number;
  parti_toplam: number;
  basarili: number;
  basarisiz: number;
  onceki_atlandi: number;
  sonraki_parti_at: string | null;
  liste_id: string | null;
  hata: string | null;
  kisi_bazli_takip?: boolean | null;
};

const IS_SELECT =
  "id, olusturulma, guncelleme, gonderen_eposta, mesaj, mesaj_parca, mesaj_birim, kampanya_kodu, varyant, durum, parti_boyutu, bekleme_sn, jitter_oran, parti_index, parti_toplam, basarili, basarisiz, onceki_atlandi, sonraki_parti_at, liste_id, hata, kisi_bazli_takip";

/** Aynı işi aynı anda iki runner işlemesin diye */
const calisanIsler = new Set<string>();

function rowToOzet(r: IsRow, aliciSayisi = 0): TopluSmsIsOzet {
  const sonraki = r.sonraki_parti_at ? new Date(r.sonraki_parti_at).getTime() : null;
  const kalanSn =
    sonraki != null && Number.isFinite(sonraki)
      ? Math.max(0, Math.ceil((sonraki - Date.now()) / 1000))
      : null;
  return {
    id: String(r.id),
    olusturulma: String(r.olusturulma),
    guncelleme: String(r.guncelleme),
    gonderenEposta: r.gonderen_eposta ? String(r.gonderen_eposta) : null,
    mesaj: String(r.mesaj ?? ""),
    mesajParca: r.mesaj_parca != null ? Number(r.mesaj_parca) : null,
    mesajBirim: r.mesaj_birim != null ? Number(r.mesaj_birim) : null,
    kampanyaKodu: r.kampanya_kodu ? String(r.kampanya_kodu) : null,
    varyant: r.varyant ? String(r.varyant) : null,
    durum: r.durum as TopluSmsIsDurum,
    partiBoyutu: Number(r.parti_boyutu) || 1,
    beklemeSn: Number(r.bekleme_sn) || 0,
    jitterOran: Number(r.jitter_oran) || 0,
    partiIndex: Number(r.parti_index) || 0,
    partiToplam: Number(r.parti_toplam) || 0,
    basarili: Number(r.basarili) || 0,
    basarisiz: Number(r.basarisiz) || 0,
    oncekiAtlandi: Number(r.onceki_atlandi) || 0,
    sonrakiPartiAt: r.sonraki_parti_at ? String(r.sonraki_parti_at) : null,
    listeId: r.liste_id ? String(r.liste_id) : null,
    hata: r.hata ? String(r.hata) : null,
    aliciSayisi,
    kalanSn:
      r.durum === "suruyor" || r.durum === "beklemede" ? kalanSn : null,
    kisiBazliTakip: Boolean(r.kisi_bazli_takip),
  };
}

async function aliciSayisi(isId: string): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("panel_toplu_sms_is_alicilar")
    .select("id", { count: "exact", head: true })
    .eq("is_id", isId);
  if (error) throw error;
  return count ?? 0;
}

export async function getTopluSmsIs(isId: string): Promise<TopluSmsIsOzet | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("panel_toplu_sms_isler")
    .select(IS_SELECT)
    .eq("id", isId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const sayi = await aliciSayisi(isId);
  return rowToOzet(data as IsRow, sayi);
}

export async function getAktifTopluSmsIsler(
  limit = 10
): Promise<TopluSmsIsOzet[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("panel_toplu_sms_isler")
    .select(IS_SELECT)
    .in("durum", ["beklemede", "suruyor"])
    .order("olusturulma", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = (data ?? []) as IsRow[];
  return Promise.all(
    rows.map(async (r) => rowToOzet(r, await aliciSayisi(String(r.id))))
  );
}

export async function olusturTopluSmsIsi(opts: {
  gonderenEposta?: string | null;
  mesaj: string;
  mesajParca?: number;
  mesajBirim?: number;
  kampanyaKodu?: string | null;
  varyant?: string | null;
  oncekiAtlandi?: number;
  tempo: TopluSmsTempo;
  kisiBazliTakip?: boolean;
  alicilar: Array<{ telefon: string; ad?: string | null }>;
}): Promise<TopluSmsIsOzet> {
  const kisiBazliTakip = Boolean(
    opts.kisiBazliTakip && opts.varyant && sms50VaryantMi(opts.varyant)
  );
  const tempoHam = kisiBazliTakip
    ? { ...opts.tempo, partiBoyutu: 1 }
    : opts.tempo;
  const tempo = topluSmsTempoNormalize(tempoHam);
  const alicilar = opts.alicilar.map((a, i) => ({
    sira: i,
    telefon: telefonNormalize(a.telefon),
    ad: a.ad?.trim() || null,
  }));
  if (alicilar.length === 0) {
    throw new Error("Gönderilecek alıcı yok.");
  }

  const partiToplam = topluSmsPartilereBol(
    alicilar,
    tempo.partiBoyutu
  ).length;

  let listeId: string | null = null;
  try {
    const kayit = await baslatTopluSmsGecmisListe({
      gonderenEposta: opts.gonderenEposta,
      mesaj: opts.mesaj,
      mesajParca: opts.mesajParca,
      mesajBirim: opts.mesajBirim,
      kampanyaKodu: opts.kampanyaKodu,
      varyant: opts.varyant,
      aliciSayisi: alicilar.length,
    });
    listeId = kayit.listeId;
  } catch (e) {
    console.error("[toplu-sms-is] geçmiş liste başlatılamadı", e);
  }

  const sb = getSupabaseAdmin();
  const { data: is, error: isErr } = await sb
    .from("panel_toplu_sms_isler")
    .insert({
      gonderen_eposta: opts.gonderenEposta ?? null,
      mesaj: opts.mesaj,
      mesaj_parca: opts.mesajParca ?? null,
      mesaj_birim: opts.mesajBirim ?? null,
      kampanya_kodu: opts.kampanyaKodu ?? null,
      varyant: opts.varyant ?? null,
      durum: "beklemede",
      parti_boyutu: tempo.partiBoyutu,
      bekleme_sn: tempo.beklemeSn,
      jitter_oran: tempo.jitterOran,
      parti_index: 0,
      parti_toplam: partiToplam,
      basarili: 0,
      basarisiz: 0,
      onceki_atlandi: opts.oncekiAtlandi ?? 0,
      sonraki_parti_at: null,
      liste_id: listeId,
      kisi_bazli_takip: kisiBazliTakip,
    })
    .select(IS_SELECT)
    .single();

  if (isErr || !is) {
    throw isErr ?? new Error("İş kaydı oluşturulamadı.");
  }

  const isId = String(is.id);
  const { error: aliciErr } = await sb.from("panel_toplu_sms_is_alicilar").insert(
    alicilar.map((a) => ({
      is_id: isId,
      sira: a.sira,
      telefon: a.telefon,
      ad: a.ad,
      durum: "beklemede",
    }))
  );
  if (aliciErr) {
    await sb.from("panel_toplu_sms_isler").delete().eq("id", isId);
    throw aliciErr;
  }

  return rowToOzet(is as IsRow, alicilar.length);
}

export async function iptalTopluSmsIs(isId: string): Promise<TopluSmsIsOzet | null> {
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("panel_toplu_sms_isler")
    .update({
      durum: "iptal",
      guncelleme: new Date().toISOString(),
      hata: "Kullanıcı tarafından durduruldu.",
    })
    .eq("id", isId)
    .in("durum", ["beklemede", "suruyor"])
    .select(IS_SELECT)
    .maybeSingle();
  if (error) throw error;
  if (!data) return getTopluSmsIs(isId);
  return rowToOzet(data as IsRow, await aliciSayisi(isId));
}

type PartiSonuc = {
  devam: boolean;
  bitti: boolean;
  iptal: boolean;
  bekleMs: number;
  ozet: TopluSmsIsOzet | null;
};

async function okuIs(isId: string): Promise<IsRow | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("panel_toplu_sms_isler")
    .select(IS_SELECT)
    .eq("id", isId)
    .maybeSingle();
  if (error) throw error;
  return (data as IsRow | null) ?? null;
}

/** Bir parti gönderir; tempo beklemesi çağırana bırakılır */
export async function isleTopluSmsSiradakiParti(
  isId: string
): Promise<PartiSonuc> {
  const sb = getSupabaseAdmin();
  const is = await okuIs(isId);
  if (!is) {
    return { devam: false, bitti: false, iptal: false, bekleMs: 0, ozet: null };
  }
  if (is.durum === "iptal") {
    return {
      devam: false,
      bitti: false,
      iptal: true,
      bekleMs: 0,
      ozet: rowToOzet(is, await aliciSayisi(isId)),
    };
  }
  if (is.durum === "bitti" || is.durum === "hata") {
    return {
      devam: false,
      bitti: is.durum === "bitti",
      iptal: false,
      bekleMs: 0,
      ozet: rowToOzet(is, await aliciSayisi(isId)),
    };
  }

  if (is.sonraki_parti_at) {
    const hedef = new Date(is.sonraki_parti_at).getTime();
    const kalan = hedef - Date.now();
    if (kalan > 250) {
      return {
        devam: true,
        bitti: false,
        iptal: false,
        bekleMs: kalan,
        ozet: rowToOzet(is, await aliciSayisi(isId)),
      };
    }
  }

  /* Crash sonrası takılı kilitleri geri al */
  await sb
    .from("panel_toplu_sms_is_alicilar")
    .update({ durum: "beklemede", hata: null })
    .eq("is_id", isId)
    .eq("durum", "gonderiliyor");

  const { data: adayAlicilar, error: aliciErr } = await sb
    .from("panel_toplu_sms_is_alicilar")
    .select("id, telefon, ad")
    .eq("is_id", isId)
    .eq("durum", "beklemede")
    .order("sira", { ascending: true })
    .limit(Math.max(1, Number(is.parti_boyutu) || 1));
  if (aliciErr) throw aliciErr;

  if (!adayAlicilar || adayAlicilar.length === 0) {
    const { data: biten, error } = await sb
      .from("panel_toplu_sms_isler")
      .update({
        durum: "bitti",
        sonraki_parti_at: null,
        guncelleme: new Date().toISOString(),
      })
      .eq("id", isId)
      .in("durum", ["beklemede", "suruyor"])
      .select(IS_SELECT)
      .maybeSingle();
    if (error) throw error;
    const ozet = biten
      ? rowToOzet(biten as IsRow, await aliciSayisi(isId))
      : await getTopluSmsIs(isId);
    return { devam: false, bitti: true, iptal: false, bekleMs: 0, ozet };
  }

  const adayIds = adayAlicilar.map((a) => a.id);
  const { data: alicilar, error: kilitErr } = await sb
    .from("panel_toplu_sms_is_alicilar")
    .update({ durum: "gonderiliyor" })
    .in("id", adayIds)
    .eq("durum", "beklemede")
    .select("id, telefon, ad");
  if (kilitErr) {
    /* 034 migration yoksa eski yolla devam */
    if (
      String(kilitErr.message ?? "").includes("gonderiliyor") ||
      String(kilitErr.code ?? "") === "23514"
    ) {
      console.warn(
        "[toplu-sms-is] gonderiliyor kilidi yok; migration 034 gerekli",
        kilitErr.message
      );
    } else {
      throw kilitErr;
    }
  }

  const kilitli =
    alicilar && alicilar.length > 0 ? alicilar : adayAlicilar;
  if (kilitli.length === 0) {
    return {
      devam: true,
      bitti: false,
      iptal: false,
      bekleMs: 500,
      ozet: rowToOzet(is, await aliciSayisi(isId)),
    };
  }

  const now = new Date().toISOString();
  const { error: suruyorErr } = await sb
    .from("panel_toplu_sms_isler")
    .update({ durum: "suruyor", guncelleme: now })
    .eq("id", isId)
    .in("durum", ["beklemede", "suruyor"]);
  if (suruyorErr) throw suruyorErr;

  const telefonlar = kilitli.map((a) => String(a.telefon));
  let sonuclar: Array<{ telefon: string; basarili: boolean; hata?: string }>;
  const kisiBazli =
    Boolean(is.kisi_bazli_takip) &&
    is.varyant &&
    sms50VaryantMi(String(is.varyant));
  try {
    if (kisiBazli) {
      const varyant = String(is.varyant) as Sms50Varyant;
      const kampanyaKodu = is.kampanya_kodu
        ? String(is.kampanya_kodu)
        : undefined;
      sonuclar = [];
      for (const a of kilitli) {
        const tel = String(a.telefon);
        try {
          const tokenKayit = await olusturSms50LinkToken({
            varyant,
            telefon: tel,
            kampanyaKodu,
            isId,
            listeId: is.liste_id ? String(is.liste_id) : null,
          });
          const kisiselMesaj = sms50MesajOlustur({
            govde: String(is.mesaj),
            varyant,
            footerEkle: false,
            baseUrl: smsBaseUrl(),
            token: tokenKayit.token,
          });
          const sonuc = await sendPanelTopluSms([tel], kisiselMesaj);
          sonuclar.push(...sonuc.sonuclar);
        } catch (e) {
          const hata = e instanceof Error ? e.message : "Gönderim hatası";
          sonuclar.push({ telefon: tel, basarili: false, hata });
        }
      }
    } else {
      const sonuc = await sendPanelTopluSms(telefonlar, String(is.mesaj));
      sonuclar = sonuc.sonuclar;
    }
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Gönderim hatası";
    await sb
      .from("panel_toplu_sms_is_alicilar")
      .update({ durum: "beklemede", hata: null })
      .in(
        "id",
        kilitli.map((a) => a.id)
      )
      .eq("durum", "gonderiliyor");
    await sb
      .from("panel_toplu_sms_isler")
      .update({
        durum: "hata",
        hata: mesaj,
        guncelleme: new Date().toISOString(),
      })
      .eq("id", isId);
    return {
      devam: false,
      bitti: false,
      iptal: false,
      bekleMs: 0,
      ozet: await getTopluSmsIs(isId),
    };
  }

  const sonucMap = new Map(sonuclar.map((s) => [s.telefon, s]));
  let ekBasarili = 0;
  let ekBasarisiz = 0;
  const gecmisSatirlar: Array<{
    telefon: string;
    ad: string | null;
    basarili: boolean;
    hata: string | null;
  }> = [];

  for (const a of kilitli) {
    const tel = String(a.telefon);
    const s = sonucMap.get(tel);
    const basarili = Boolean(s?.basarili);
    const hata = s?.hata ?? (basarili ? null : "Bilinmeyen hata");
    if (basarili) ekBasarili += 1;
    else ekBasarisiz += 1;
    gecmisSatirlar.push({
      telefon: tel,
      ad: a.ad ? String(a.ad) : null,
      basarili,
      hata,
    });
    const { error } = await sb
      .from("panel_toplu_sms_is_alicilar")
      .update({
        durum: basarili ? "gonderildi" : "basarisiz",
        hata,
      })
      .eq("id", a.id);
    if (error) throw error;
  }

  if (is.liste_id) {
    try {
      await ekleTopluSmsGecmisAlicilar(String(is.liste_id), gecmisSatirlar);
    } catch (e) {
      console.error("[toplu-sms-is] geçmiş parti kaydı başarısız", e);
    }
  }

  const yeniden = await okuIs(isId);
  if (yeniden?.durum === "iptal") {
    return {
      devam: false,
      bitti: false,
      iptal: true,
      bekleMs: 0,
      ozet: rowToOzet(yeniden, await aliciSayisi(isId)),
    };
  }

  const { count: kalan } = await sb
    .from("panel_toplu_sms_is_alicilar")
    .select("id", { count: "exact", head: true })
    .eq("is_id", isId)
    .eq("durum", "beklemede");

  const partiIndex = (Number(is.parti_index) || 0) + 1;
  const tempo: TopluSmsTempo = {
    partiBoyutu: Number(is.parti_boyutu) || 10,
    beklemeSn: Number(is.bekleme_sn) || 0,
    jitterOran: Number(is.jitter_oran) || 0,
  };
  const bitti = (kalan ?? 0) === 0;
  const bekleMs = bitti ? 0 : topluSmsPartiBeklemeMs(tempo);
  const sonraki =
    bitti || bekleMs <= 0
      ? null
      : new Date(Date.now() + bekleMs).toISOString();

  const { data: guncel, error: guncelleErr } = await sb
    .from("panel_toplu_sms_isler")
    .update({
      durum: bitti ? "bitti" : "suruyor",
      parti_index: partiIndex,
      basarili: (Number(is.basarili) || 0) + ekBasarili,
      basarisiz: (Number(is.basarisiz) || 0) + ekBasarisiz,
      sonraki_parti_at: sonraki,
      guncelleme: new Date().toISOString(),
      hata: null,
    })
    .eq("id", isId)
    .neq("durum", "iptal")
    .select(IS_SELECT)
    .maybeSingle();
  if (guncelleErr) throw guncelleErr;

  if (!guncel) {
    const son = await getTopluSmsIs(isId);
    return {
      devam: false,
      bitti: son?.durum === "bitti",
      iptal: son?.durum === "iptal",
      bekleMs: 0,
      ozet: son,
    };
  }

  return {
    devam: !bitti,
    bitti,
    iptal: false,
    bekleMs,
    ozet: rowToOzet(guncel as IsRow, await aliciSayisi(isId)),
  };
}

type GlobalScheduler = typeof globalThis & {
  __topluSmsScheduler?: ReturnType<typeof setInterval>;
  __topluSmsSchedulerBusy?: boolean;
};

const SCHEDULER_MS = 8_000;

/**
 * Node süreci ayakta kaldığı sürece tempo bekleyen partileri işler.
 * `after()` uzun uyku yapamaz (istek bitince kesilir); bu yüzden süreç
 * zamanlayıcısı zorunlu.
 */
export function ensureTopluSmsScheduler(): void {
  const g = globalThis as GlobalScheduler;
  if (g.__topluSmsScheduler) return;
  g.__topluSmsScheduler = setInterval(() => {
    if (g.__topluSmsSchedulerBusy) return;
    g.__topluSmsSchedulerBusy = true;
    void isleBekleyenTopluSmsIsleri(5)
      .catch((e) => console.error("[toplu-sms-is] scheduler", e))
      .finally(() => {
        g.__topluSmsSchedulerBusy = false;
      });
  }, SCHEDULER_MS);
}

/** Zamanlayıcıyı aç + vadesi gelen partileri hemen bir tur işle */
export async function tetikleTopluSmsKuyruk(): Promise<{
  islenen: number;
  isIds: string[];
}> {
  ensureTopluSmsScheduler();
  return isleBekleyenTopluSmsIsleri(5);
}

/** @deprecated Uzun uyku güvenilir değil; tetikleTopluSmsKuyruk kullan */
export async function calistirTopluSmsIsi(isId: string): Promise<void> {
  ensureTopluSmsScheduler();
  if (calisanIsler.has(isId)) return;
  calisanIsler.add(isId);
  try {
    while (true) {
      const r = await isleTopluSmsSiradakiParti(isId);
      if (!r.devam) break;
      if (r.bekleMs > 0) break; // beklemeyi scheduler'a bırak
    }
  } catch (e) {
    console.error("[toplu-sms-is] runner hata", isId, e);
    try {
      await getSupabaseAdmin()
        .from("panel_toplu_sms_isler")
        .update({
          durum: "hata",
          hata: e instanceof Error ? e.message : "Beklenmeyen hata",
          guncelleme: new Date().toISOString(),
        })
        .eq("id", isId)
        .in("durum", ["beklemede", "suruyor"]);
    } catch {
      /* ignore */
    }
  } finally {
    calisanIsler.delete(isId);
  }
}

/**
 * Cron / kurtarma / scheduler: zamanı gelen partileri işle.
 * Tempo beklemesi yapmaz; bekleme gereken işte durur.
 */
export async function isleBekleyenTopluSmsIsleri(
  limit = 5
): Promise<{ islenen: number; isIds: string[] }> {
  ensureTopluSmsScheduler();
  const sb = getSupabaseAdmin();
  const { data, error } = await sb
    .from("panel_toplu_sms_isler")
    .select("id, sonraki_parti_at")
    .in("durum", ["beklemede", "suruyor"])
    .order("olusturulma", { ascending: true })
    .limit(Math.max(limit * 3, 15));
  if (error) throw error;

  const now = Date.now();
  const adaylar = (data ?? [])
    .filter((row) => {
      if (!row.sonraki_parti_at) return true;
      const t = new Date(String(row.sonraki_parti_at)).getTime();
      return !Number.isFinite(t) || t <= now;
    })
    .slice(0, limit);

  const isIds: string[] = [];
  for (const row of adaylar) {
    const id = String(row.id);
    if (calisanIsler.has(id)) continue;
    calisanIsler.add(id);
    try {
      let dokunuldu = false;
      while (true) {
        const r = await isleTopluSmsSiradakiParti(id);
        dokunuldu = true;
        if (!r.devam || r.bekleMs > 0) break;
      }
      if (dokunuldu) isIds.push(id);
    } finally {
      calisanIsler.delete(id);
    }
  }
  return { islenen: isIds.length, isIds };
}
