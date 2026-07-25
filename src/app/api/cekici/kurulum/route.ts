import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { updateCekici } from "@/lib/db";
import { ilGecerliMi, ilceListesi } from "@/lib/il-ilce";
import { normalizeHizmetBolgeleri } from "@/lib/cekici-hizmet-bolge";
import type { HizmetBolgeleri } from "@/lib/types";
import { gecerliSorunTipi } from "@/lib/sorun-tipleri";
import { kayitFunnelMi } from "@/lib/kayit-funnel";
import { kaydetKayitFunnelOlay } from "@/lib/kayit-funnel-olay";
import { cekiciProfilHazirMi } from "@/lib/cekici-profil-hazir";

export async function GET() {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }
  const adParcalar = String(cekici.ad ?? "")
    .trim()
    .split(/\s+/);
  const isim = adParcalar[0] ?? "";
  const soyad = adParcalar.length > 1 ? adParcalar.slice(1).join(" ") : "";

  return NextResponse.json({
    ad: cekici.ad,
    isim,
    soyad,
    sehir: cekici.sehir,
    hizmetBolgeleri: cekici.hizmetBolgeleri ?? {},
    hizmetSorunTipleri: cekici.hizmetSorunTipleri ?? [],
    kurulumTamam: cekici.kurulumTamam !== false,
    profilHazir: cekiciProfilHazirMi(cekici),
    kayitFunnel: cekici.kayitFunnel ?? null,
  });
}

export async function POST(request: NextRequest) {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json();
  const adim = Number(body.adim);
  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : null;
  const funnel =
    (cekici.kayitFunnel && kayitFunnelMi(cekici.kayitFunnel)
      ? cekici.kayitFunnel
      : null) ?? "b";

  if (adim === 1) {
    const isim = String(body.isim ?? body.ad ?? "").trim();
    const soyad = String(body.soyad ?? "").trim();
    if (isim.length < 2) {
      return NextResponse.json(
        { error: "İsim en az 2 karakter olmalı." },
        { status: 400 }
      );
    }
    if (soyad.length < 2) {
      return NextResponse.json(
        { error: "Soyisim en az 2 karakter olmalı." },
        { status: 400 }
      );
    }
    const sehir = String(body.sehir ?? "İstanbul").trim();
    if (!ilGecerliMi(sehir)) {
      return NextResponse.json({ error: "Geçerli bir il seçin." }, { status: 400 });
    }

    const ham = Array.isArray(body.sorunTipleri) ? body.sorunTipleri : [];
    const secili: string[] = [];
    for (const x of ham) {
      const id = String(x);
      if (gecerliSorunTipi(id) && !secili.includes(id)) secili.push(id);
    }
    if (secili.length === 0) {
      return NextResponse.json(
        { error: "En az bir hizmet / sorun tipi seçin." },
        { status: 400 }
      );
    }

    cekici.ad = `${isim} ${soyad}`.trim();
    cekici.sehir = sehir;
    cekici.hizmetSorunTipleri = secili;
    await updateCekici(cekici);
    await kaydetKayitFunnelOlay({
      funnel,
      olay: "kurulum_1",
      sessionId,
      cekiciId: cekici.id,
    });
    return NextResponse.json({ ok: true, sonraki: 2 });
  }

  if (adim === 2) {
    const tumIstanbul = Boolean(body.tumIstanbul);
    let bolgeler: HizmetBolgeleri = {};
    if (tumIstanbul) {
      const il =
        cekici.sehir && ilGecerliMi(cekici.sehir) ? cekici.sehir : "İstanbul";
      bolgeler = { [il]: ilceListesi(il) };
    } else {
      bolgeler = normalizeHizmetBolgeleri(body.bolgeler as HizmetBolgeleri);
    }
    if (Object.keys(bolgeler).length === 0) {
      return NextResponse.json(
        { error: "En az bir ilçe seçin." },
        { status: 400 }
      );
    }
    cekici.hizmetBolgeleri = bolgeler;
    cekici.hizmetIlceleri = Object.values(bolgeler).flat();
    cekici.hizmetModu = "il_ilce";
    /* Menzil kurulumda yok — varsayılan kalsın; ayarlardan değişir */
    cekici.kurulumTamam = true;
    await updateCekici(cekici);
    await kaydetKayitFunnelOlay({
      funnel,
      olay: "kurulum_2",
      sessionId,
      cekiciId: cekici.id,
    });
    await kaydetKayitFunnelOlay({
      funnel,
      olay: "panel_hazir",
      sessionId,
      cekiciId: cekici.id,
    });
    return NextResponse.json({
      ok: true,
      sonraki: null,
      yonlendir: "/cekici/panel",
      cekiciId: cekici.id,
    });
  }

  return NextResponse.json({ error: "Geçersiz adım." }, { status: 400 });
}
