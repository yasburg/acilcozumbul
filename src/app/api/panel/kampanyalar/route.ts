import { NextRequest, NextResponse } from "next/server";
import { getCekiciByDavetKodu } from "@/lib/db";
import {
  ekleKampanya,
  getKampanyaByKod,
  getKampanyaKullanimlari,
  getKampanyalar,
  guncelleKampanya,
  type KampanyaGuncellePatch,
} from "@/lib/kampanya-db";
import {
  kampanyaKoduGecerliMi,
  kampanyaKoduNormalize,
} from "@/lib/kampanya-kodu";
import {
  kampanyaKoduSutunuVar,
  MIGRATION_014_MESAJ,
} from "@/lib/supabase/kampanya-schema";
import { getKayitUcretsizKrediAyar } from "@/lib/kayit-ucretsiz-kredi";
import {
  getTeklifCashbackAyar,
  teklifCashbackDurum,
} from "@/lib/teklif-cashback-kampanya";

/** datetime-local / ISO / boş → ISO veya null (temizle) */
function tarihAlani(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  if (typeof v !== "string") return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function maxKullanimAlani(v: unknown): number | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.floor(n);
}

export async function GET() {
  if (!(await kampanyaKoduSutunuVar())) {
    return NextResponse.json({ error: MIGRATION_014_MESAJ }, { status: 503 });
  }

  const [kampanyalar, kullanimlar, ucretsizKrediAyar, teklifCashbackAyar] =
    await Promise.all([
      getKampanyalar(),
      getKampanyaKullanimlari(),
      getKayitUcretsizKrediAyar().catch(() => ({
        aktif: true,
        krediMiktar: 9,
      })),
      getTeklifCashbackAyar().catch(() => ({ aktif: false })),
    ]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acilcozumbul.com";

  return NextResponse.json({
    liste: kampanyalar.map((k) => ({
      ...k,
      kayitLink: `${siteUrl}/kayit/a?kampanya=${encodeURIComponent(k.kod)}`,
    })),
    kullanimlar,
    ucretsizKrediAyar,
    teklifCashbackAyar,
    teklifCashbackDurum: teklifCashbackDurum(teklifCashbackAyar),
    ozet: {
      toplamKampanya: kampanyalar.length,
      aktifKampanya: kampanyalar.filter((k) => k.aktif).length,
      toplamKullanim: kullanimlar.length,
      toplamVerilenKredi: kullanimlar.reduce((s, u) => s + u.verilenKredi, 0),
    },
  });
}

export async function POST(request: NextRequest) {
  if (!(await kampanyaKoduSutunuVar())) {
    return NextResponse.json({ error: MIGRATION_014_MESAJ }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const ham = typeof body.kod === "string" ? body.kod : "";
  const dogrulama = kampanyaKoduGecerliMi(ham);
  if (!dogrulama.ok || !dogrulama.kod) {
    return NextResponse.json(
      { error: dogrulama.hata ?? "Geçersiz kod." },
      { status: 400 }
    );
  }

  const yeniUyeKredi = Number(body.yeniUyeKredi);
  if (!Number.isFinite(yeniUyeKredi) || yeniUyeKredi <= 0) {
    return NextResponse.json(
      { error: "Geçerli bir kredi miktarı girin." },
      { status: 400 }
    );
  }

  const mevcutDavet = await getCekiciByDavetKodu(dogrulama.kod);
  if (mevcutDavet) {
    return NextResponse.json(
      { error: "Bu kod bir hizmet verenin davet kodu olarak kullanılıyor." },
      { status: 409 }
    );
  }

  try {
    await ekleKampanya({
      kod: dogrulama.kod,
      yeniUyeKredi,
      kanal: typeof body.kanal === "string" ? body.kanal.trim() || undefined : undefined,
      aciklama:
        typeof body.aciklama === "string"
          ? body.aciklama.trim() || undefined
          : undefined,
      baslangic: tarihAlani(body.baslangic) ?? undefined,
      bitis: tarihAlani(body.bitis) ?? undefined,
      maxKullanim: maxKullanimAlani(body.maxKullanim) ?? undefined,
      aktif: body.aktif !== false,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      return NextResponse.json(
        { error: "Bu kampanya kodu zaten var." },
        { status: 409 }
      );
    }
    throw e;
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acilcozumbul.com";

  return NextResponse.json({
    kod: dogrulama.kod,
    mesaj: "Kampanya kodu oluşturuldu.",
    kayitLink: `${siteUrl}/kayit/a?kampanya=${encodeURIComponent(dogrulama.kod)}`,
  });
}

export async function PATCH(request: NextRequest) {
  if (!(await kampanyaKoduSutunuVar())) {
    return NextResponse.json({ error: MIGRATION_014_MESAJ }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const kod =
    typeof body.kod === "string" ? kampanyaKoduNormalize(body.kod) : "";
  if (!kod) {
    return NextResponse.json({ error: "Kod gerekli." }, { status: 400 });
  }

  const mevcut = await getKampanyaByKod(kod);
  if (!mevcut) {
    return NextResponse.json({ error: "Kampanya bulunamadı." }, { status: 404 });
  }

  const maxKullanim = Object.prototype.hasOwnProperty.call(body, "maxKullanim")
    ? maxKullanimAlani(body.maxKullanim)
    : undefined;
  if (
    Object.prototype.hasOwnProperty.call(body, "maxKullanim") &&
    body.maxKullanim !== null &&
    body.maxKullanim !== "" &&
    maxKullanim === undefined
  ) {
    return NextResponse.json(
      { error: "Geçerli bir kullanım limiti girin (veya boş bırakın)." },
      { status: 400 }
    );
  }
  if (maxKullanim != null && maxKullanim < mevcut.kullanimSayisi) {
    return NextResponse.json(
      {
        error: `Limit, mevcut kullanımdan (${mevcut.kullanimSayisi}) düşük olamaz.`,
      },
      { status: 400 }
    );
  }

  const bitis = Object.prototype.hasOwnProperty.call(body, "bitis")
    ? tarihAlani(body.bitis)
    : undefined;
  if (
    Object.prototype.hasOwnProperty.call(body, "bitis") &&
    body.bitis !== null &&
    body.bitis !== "" &&
    bitis === undefined
  ) {
    return NextResponse.json(
      { error: "Geçerli bir bitiş tarihi girin." },
      { status: 400 }
    );
  }

  const baslangic = Object.prototype.hasOwnProperty.call(body, "baslangic")
    ? tarihAlani(body.baslangic)
    : undefined;

  const patch: KampanyaGuncellePatch = {
    aktif: typeof body.aktif === "boolean" ? body.aktif : undefined,
    yeniUyeKredi:
      body.yeniUyeKredi != null && body.yeniUyeKredi !== ""
        ? Number(body.yeniUyeKredi)
        : undefined,
    kanal: typeof body.kanal === "string" ? body.kanal.trim() : undefined,
    aciklama:
      typeof body.aciklama === "string" ? body.aciklama.trim() : undefined,
    baslangic,
    bitis,
    maxKullanim,
  };

  if (
    patch.yeniUyeKredi != null &&
    (!Number.isFinite(patch.yeniUyeKredi) || patch.yeniUyeKredi <= 0)
  ) {
    return NextResponse.json(
      { error: "Geçerli bir kredi miktarı girin." },
      { status: 400 }
    );
  }

  await guncelleKampanya(kod, patch);

  return NextResponse.json({ mesaj: "Kampanya güncellendi." });
}
