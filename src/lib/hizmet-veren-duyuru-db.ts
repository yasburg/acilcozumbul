import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import {
  bildirimPaketiDuyuruGovdeSablon,
  DUYURU_AYARLAR_URL_PH,
  duyuruBolumlerDoldur,
  duyuruBolumlerParse,
  duyuruGovdeDoldur,
  type HizmetVerenDuyuruSablon,
  type HizmetVerenDuyuruSablonKayit,
} from "./hizmet-veren-duyuru";
import {
  netgsmSmsBolumlerGecerliMi,
  netgsmSmsMesajGecerliMi,
} from "./sms-karakter";

export type { HizmetVerenDuyuruSablonKayit };

let tabloVar: boolean | null = null;

export const MIGRATION_060_MESAJ =
  "Duyuru şablonları için supabase/migrations/060_hizmet_veren_duyuru_sablonlar.sql dosyasını çalıştırın.";

const ORNEK_AYARLAR_URL =
  "https://www.acilcozumbul.com/cekici/panel?tab=ayarlar";

const SELECT_KOLONLAR =
  "id, etiket, aciklama, govde, bolumler, aktif, sira, olusturulma, guncelleme";

export async function hizmetVerenDuyuruSablonTablosuVar(): Promise<boolean> {
  /* true kalıcı; false her seferinde yeniden kontrol (migration sonrası) */
  if (tabloVar === true) return true;
  if (!supabaseDbAktif()) {
    tabloVar = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("panel_hizmet_veren_duyuru_sablonlar")
    .select("id")
    .limit(1);
  tabloVar = !error;
  return tabloVar;
}

function satirMap(r: Record<string, unknown>): HizmetVerenDuyuruSablonKayit {
  return {
    id: String(r.id),
    etiket: String(r.etiket ?? ""),
    aciklama: String(r.aciklama ?? ""),
    govde: String(r.govde ?? ""),
    bolumler: duyuruBolumlerParse(r.bolumler),
    aktif: Boolean(r.aktif),
    sira: Number(r.sira) || 0,
    olusturulma: String(r.olusturulma ?? ""),
    guncelleme: String(r.guncelleme ?? ""),
  };
}

function kurAktifSablon(
  kayit: Pick<
    HizmetVerenDuyuruSablonKayit,
    "id" | "etiket" | "aciklama" | "govde" | "bolumler" | "aktif" | "sira"
  >,
  ayarlarUrl: string
): HizmetVerenDuyuruSablon {
  const bolumlerHam = kayit.bolumler;
  return {
    id: kayit.id,
    etiket: kayit.etiket,
    aciklama: kayit.aciklama,
    govde: kayit.govde,
    mesaj: duyuruGovdeDoldur(kayit.govde, ayarlarUrl),
    bolumlerHam,
    bolumler: duyuruBolumlerDoldur(bolumlerHam, ayarlarUrl),
    aktif: kayit.aktif,
    sira: kayit.sira,
  };
}

export function duyuruSablonBolumlerDogrula(
  bolumler: unknown,
  ayarlarUrl = ORNEK_AYARLAR_URL
): { bolumler: string[] | null } | { error: string } {
  if (bolumler === null) return { bolumler: null };
  if (bolumler === undefined) return { bolumler: null };
  const ham = duyuruBolumlerParse(bolumler);
  if (!ham) {
    if (Array.isArray(bolumler) && bolumler.length === 0) {
      return { bolumler: null };
    }
    if (Array.isArray(bolumler) && bolumler.length === 1) {
      return { bolumler: null };
    }
    return { error: "Bölümler en az 2 SMS parçası olmalı." };
  }
  const dolu = duyuruBolumlerDoldur(ham, ayarlarUrl);
  if (!dolu) return { error: "Bölümler geçersiz." };
  const kontrol = netgsmSmsBolumlerGecerliMi(dolu);
  if (!kontrol.gecerli) {
    return { error: kontrol.hata ?? "Bölümler geçersiz." };
  }
  return { bolumler: ham };
}

export function duyuruSablonAlanDogrula(opts: {
  etiket?: unknown;
  aciklama?: unknown;
  govde?: unknown;
  sira?: unknown;
  bolumler?: unknown;
}):
  | {
      etiket: string;
      aciklama: string;
      govde: string;
      sira: number;
      bolumler: string[] | null;
    }
  | { error: string } {
  const etiket = typeof opts.etiket === "string" ? opts.etiket.trim() : "";
  const aciklama =
    typeof opts.aciklama === "string" ? opts.aciklama.trim() : "";
  const govde = typeof opts.govde === "string" ? opts.govde.trim() : "";
  const siraHam = opts.sira;
  const sira =
    typeof siraHam === "number"
      ? Math.floor(siraHam)
      : typeof siraHam === "string" && siraHam.trim()
        ? Number.parseInt(siraHam, 10)
        : 0;

  if (!etiket) return { error: "Etiket gerekli." };
  if (etiket.length > 120) return { error: "Etiket en fazla 120 karakter." };
  if (aciklama.length > 300) return { error: "Açıklama en fazla 300 karakter." };
  if (!govde) return { error: "SMS metni gerekli." };
  if (govde.length > 2000) return { error: "SMS metni en fazla 2000 karakter." };

  /* Yer tutucu varsa gerçek URL’den uzun örnekle doğrula */
  const ornekUrl =
    "https://www.acilcozumbul.com/cekici/panel?tab=ayarlar&x=" +
    "0123456789abcdef";
  const ornek = govde.includes(DUYURU_AYARLAR_URL_PH)
    ? duyuruGovdeDoldur(govde, ornekUrl)
    : govde;
  const kontrol = netgsmSmsMesajGecerliMi(ornek);
  if (!kontrol.gecerli) {
    return { error: kontrol.hata ?? "SMS metni geçersiz." };
  }

  if (!Number.isFinite(sira) || sira < 0 || sira > 9999) {
    return { error: "Sıra 0–9999 arası olmalı." };
  }

  let bolumler: string[] | null = null;
  if (opts.bolumler !== undefined) {
    const b = duyuruSablonBolumlerDogrula(opts.bolumler, ornekUrl);
    if ("error" in b) return b;
    bolumler = b.bolumler;
  }

  return { etiket, aciklama, govde, sira, bolumler };
}

export async function listeHizmetVerenDuyuruSablonlari(): Promise<
  HizmetVerenDuyuruSablonKayit[]
> {
  if (!(await hizmetVerenDuyuruSablonTablosuVar())) {
    throw new Error(MIGRATION_060_MESAJ);
  }
  const { data, error } = await getSupabaseAdmin()
    .from("panel_hizmet_veren_duyuru_sablonlar")
    .select(SELECT_KOLONLAR)
    .order("sira", { ascending: true })
    .order("olusturulma", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r: any) => satirMap(r as Record<string, unknown>));
}

export async function listeAktifHizmetVerenDuyuruSablonlari(
  ayarlarUrl: string
): Promise<HizmetVerenDuyuruSablon[]> {
  if (!(await hizmetVerenDuyuruSablonTablosuVar())) {
    const govde = bildirimPaketiDuyuruGovdeSablon();
    return [
      kurAktifSablon(
        {
          id: "yerlesik-bildirim-paketi",
          etiket: "Bildirim paketi (1 / 2 / 3 kredi)",
          aciklama:
            "Yeni sesli arama + hızlı SMS paketini tüm hizmet verenlere duyurur.",
          govde,
          bolumler: null,
          aktif: true,
          sira: 0,
        },
        ayarlarUrl
      ),
    ];
  }

  const { data, error } = await getSupabaseAdmin()
    .from("panel_hizmet_veren_duyuru_sablonlar")
    .select("id, etiket, aciklama, govde, bolumler, aktif, sira")
    .eq("aktif", true)
    .order("sira", { ascending: true })
    .order("olusturulma", { ascending: true });
  if (error) throw error;

  const liste = (data ?? []).map((r: any) =>
    kurAktifSablon(satirMap(r as Record<string, unknown>), ayarlarUrl)
  );

  if (liste.length === 0) {
    const govde = bildirimPaketiDuyuruGovdeSablon();
    return [
      kurAktifSablon(
        {
          id: "yerlesik-bildirim-paketi",
          etiket: "Bildirim paketi (1 / 2 / 3 kredi)",
          aciklama:
            "Yeni sesli arama + hızlı SMS paketini tüm hizmet verenlere duyurur.",
          govde,
          bolumler: null,
          aktif: true,
          sira: 0,
        },
        ayarlarUrl
      ),
    ];
  }
  return liste;
}

export async function olusturHizmetVerenDuyuruSablon(opts: {
  etiket: string;
  aciklama: string;
  govde: string;
  bolumler?: string[] | null;
  sira?: number;
  aktif?: boolean;
}): Promise<HizmetVerenDuyuruSablonKayit> {
  if (!(await hizmetVerenDuyuruSablonTablosuVar())) {
    throw new Error(MIGRATION_060_MESAJ);
  }
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("panel_hizmet_veren_duyuru_sablonlar")
    .insert({
      etiket: opts.etiket,
      aciklama: opts.aciklama,
      govde: opts.govde,
      bolumler: opts.bolumler ?? null,
      sira: opts.sira ?? 0,
      aktif: opts.aktif !== false,
      olusturulma: now,
      guncelleme: now,
    })
    .select(SELECT_KOLONLAR)
    .single();
  if (error || !data) throw error ?? new Error("Şablon oluşturulamadı.");
  return satirMap(data as Record<string, unknown>);
}

export async function guncelleHizmetVerenDuyuruSablon(
  id: string,
  patch: {
    etiket?: string;
    aciklama?: string;
    govde?: string;
    bolumler?: string[] | null;
    sira?: number;
    aktif?: boolean;
  }
): Promise<HizmetVerenDuyuruSablonKayit> {
  if (!(await hizmetVerenDuyuruSablonTablosuVar())) {
    throw new Error(MIGRATION_060_MESAJ);
  }
  const { data, error } = await getSupabaseAdmin()
    .from("panel_hizmet_veren_duyuru_sablonlar")
    .update({
      ...patch,
      guncelleme: new Date().toISOString(),
    })
    .eq("id", id)
    .select(SELECT_KOLONLAR)
    .single();
  if (error || !data) throw error ?? new Error("Şablon güncellenemedi.");
  return satirMap(data as Record<string, unknown>);
}

export async function silHizmetVerenDuyuruSablon(id: string): Promise<void> {
  if (!(await hizmetVerenDuyuruSablonTablosuVar())) {
    throw new Error(MIGRATION_060_MESAJ);
  }
  const { error } = await getSupabaseAdmin()
    .from("panel_hizmet_veren_duyuru_sablonlar")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
