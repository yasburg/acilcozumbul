import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentCekici } from "@/lib/auth";
import { getTalepById, updateTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { cekiciTalepBolgesineUygunMu } from "@/lib/cekici-bolge";
import { cekiciTalepSorununaUygunMu } from "@/lib/cekici-sorun";
import {
  aktifTeklifler,
  cekiciHaricMi,
  cekiciTalebeBildirildiMi,
  cekiciTeklifVerebilirMi,
  musteriYeniTeklifSmsGonderilsinMi,
  SMS_BILDIRIM_KREDI,
} from "@/lib/ihale";
import { insertTeklif } from "@/lib/teklif-db";
import { refreshCekiciPuanOzet } from "@/lib/puan-ozet-db";
import { notifyMusteri } from "@/lib/sms";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { talepBolge, talepSorunOzet } from "@/lib/talep-utils";
import type { Teklif } from "@/lib/types";
import { demoTalepGetir, demoTeklifEkle, isDemoTalepId } from "@/lib/demo-oturum";
import { demoTeklifMesaji } from "@/lib/demo-responses";
import {
  sehirBeklemeMesaji,
} from "@/lib/cekici-sehir-acilis";
import { cekiciToplamKredi } from "@/lib/kredi-bakiye";
import { sehirKullanimAcikMiDb } from "@/lib/cekici-sehir-acilis-db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!(await sehirKullanimAcikMiDb(cekici.sehir))) {
    return NextResponse.json(
      {
        error: sehirBeklemeMesaji(cekici.sehir),
        sehirBeklemede: true,
      },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const fiyat = Number(body.fiyat);
  const tahminiSureDk = Number(body.tahminiSureDk) || 30;
  const mesaj = body.mesaj?.trim();

  if (!fiyat || fiyat < 100) {
    return NextResponse.json(
      { error: "Geçerli bir fiyat girin (min. 100 TL)." },
      { status: 400 }
    );
  }

  const demoCtx = isDemoTalepId(id)
    ? await demoTalepGetir(id, request, cekici.id)
    : null;
  if (isDemoTalepId(id)) {
    if (!demoCtx) {
      return NextResponse.json(
        { error: "Demo oturumu bulunamadı.", demoHatasi: true },
        { status: 404 }
      );
    }
    const talep = demoCtx.talep;
    if (cekiciHaricMi(talep, cekici.id)) {
      return NextResponse.json(
        { error: "Müşteri sizi tercih etmedi.", tercihEdilmedi: true },
        { status: 403 }
      );
    }
    if (talep.kazananCekiciId === cekici.id) {
      return NextResponse.json({ kazandim: true, talepId: talep.id, demoModu: true });
    }
    try {
      const { oturum: yeniOturum, teklif } = await demoTeklifEkle(
        demoCtx.oturum,
        id,
        cekici,
        { fiyat, tahminiSureDk, mesaj }
      );
      const guncelTalep =
        yeniOturum.durum.talepler.find((t) => t.id === id) ?? talep;
      return NextResponse.json(
        demoTeklifMesaji(cekici, guncelTalep, teklif.id)
      );
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Teklif verilemedi." },
        { status: 409 }
      );
    }
  }

  let talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  if (cekiciHaricMi(talep, cekici.id)) {
    return NextResponse.json(
      { error: "Müşteri sizi tercih etmedi.", tercihEdilmedi: true },
      { status: 403 }
    );
  }

  if (!cekiciTalepBolgesineUygunMu(cekici, talep)) {
    return NextResponse.json(
      { error: "Bu talep hizmet bölgelerinizin dışında." },
      { status: 403 }
    );
  }

  if (!cekiciTalepSorununaUygunMu(cekici, talep)) {
    return NextResponse.json(
      {
        error:
          "Bu sorun tipi hesabınızda tanımlı değil. Ayarlardan hizmet verdiğiniz sorunları güncelleyin.",
      },
      { status: 403 }
    );
  }

  if (talep.kazananCekiciId === cekici.id) {
    return NextResponse.json({ kazandim: true, talepId: talep.id });
  }

  if (!cekiciTeklifVerebilirMi(talep, cekici.id)) {
    if (talep.kazananCekiciId) {
      return NextResponse.json(
        { error: "İhale kapandı. Müşteri teklif seçti." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Bu talebe artık teklif verilemez." },
      { status: 409 }
    );
  }

  talep = (await getTalepById(id))!;
  if (!cekiciTeklifVerebilirMi(talep, cekici.id)) {
    return NextResponse.json(
      { error: "Bu talebe az önce teklif verildi veya ihale kapandı." },
      { status: 409 }
    );
  }

  if (!cekiciTalebeBildirildiMi(talep, cekici.id)) {
    return NextResponse.json(
      {
        error:
          cekiciToplamKredi(cekici) < SMS_BILDIRIM_KREDI
            ? "Bu talep size bildirilmedi. Kredi yükleyerek yeni talep SMS'leri alabilirsiniz."
            : "Bu talep size SMS ile bildirilmedi.",
        erisimYok: true,
      },
      { status: 403 }
    );
  }

  const teklif: Teklif = {
    id: randomUUID(),
    cekiciId: cekici.id,
    cekiciAd: cekici.ad,
    fiyat,
    ilkFiyat: fiyat,
    fiyatDegisti: false,
    tahminiSureDk,
    mesaj,
    tarih: new Date().toISOString(),
    durum: "aktif",
  };

  const eklendi = await insertTeklif(id, teklif).catch((e: unknown) => {
    const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";
    if (code === "42P01" || code === "PGRST205") return true;
    throw e;
  });
  if (!eklendi) {
    return NextResponse.json(
      { error: "Bu talebe az önce teklif verildi veya ihale kapandı." },
      { status: 409 }
    );
  }

  talep.teklifler = [...(talep.teklifler ?? []), teklif];
  await updateTalep(talep);
  await refreshCekiciPuanOzet(cekici.id).catch(() => {});

  const baseUrl = smsBaseUrl(
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
  const aktifSayi = aktifTeklifler(talep).length;
  // Acil: ilk 3 teklifte OTP SMS; diğer ihalelerde yalnızca ilk teklif
  if (musteriYeniTeklifSmsGonderilsinMi(talep, aktifSayi)) {
    await notifyMusteri(talep, "yeni_teklif", baseUrl).catch(() => {});
  }

  return NextResponse.json({
    teklifId: teklif.id,
    kredi: cekiciToplamKredi(cekici),
    mesaj: "Teklifiniz alındı. Ücretsiz — müşteri seçim yapana kadar bekleyin.",
    onizleme: {
      bolge: talepBolge(talep),
      sorunOzet: talepSorunOzet(talep.sorun),
    },
  });
}
