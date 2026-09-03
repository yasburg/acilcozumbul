import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { updateCekici } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import {
  BILDIRIM_SEVIYE_ETIKET,
  BILDIRIM_SEVIYE_VARSAYILAN,
  bildirimSeviyeNormalize,
  cekiciBildirimKrediTutari,
  cekiciBildirimSeviye,
  type BildirimSeviye,
} from "@/lib/ihale";
import { cekiciGirisSifreKontrol } from "@/lib/cekici-auth";
import { smsDurumu } from "@/lib/sms-provider";
import { telefonMaskele } from "@/lib/telefon";
import { teklifCashbackKampanyaAktifMi } from "@/lib/teklif-cashback-kampanya";

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const seviye = cekiciBildirimSeviye(cekici);
  const cashbackAktif = await teklifCashbackKampanyaAktifMi().catch(() => false);
  return NextResponse.json({
    bildirimSeviye: seviye,
    bildirimKredi: cekiciBildirimKrediTutari(cekici),
    paketler: ([1, 2, 3] as BildirimSeviye[]).map((s) => ({
      seviye: s,
      kredi: s,
      ...BILDIRIM_SEVIYE_ETIKET[s],
    })),
    varsayilan: BILDIRIM_SEVIYE_VARSAYILAN,
    /** Geriye uyum */
    premiumSmsAktif: seviye >= 2,
    panelKredi: 1,
    premiumKredi: 2,
    telefon: telefonMaskele(cekici.telefon),
    smsGercek: smsDurumu().gercekGonderim,
    cashbackAktif,
  });
}

/** Bildirim paketi değiştir — hesap şifresi gerekir */
export async function PUT(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const sifre = String(body.sifre ?? "");

  let seviye: BildirimSeviye;
  if (body.bildirimSeviye != null) {
    seviye = bildirimSeviyeNormalize(body.bildirimSeviye);
  } else if (typeof body.premiumSmsAktif === "boolean") {
    /* Eski istemci: aç → 3 (önerilen), kapa → 1 */
    seviye = body.premiumSmsAktif ? 3 : 1;
  } else {
    return NextResponse.json(
      { error: "bildirimSeviye gerekli (1, 2 veya 3)." },
      { status: 400 }
    );
  }

  if (!sifre.trim()) {
    return NextResponse.json(
      { error: "Değişiklik için hesap şifrenizi girin." },
      { status: 400 }
    );
  }

  const sifreOk = await cekiciGirisSifreKontrol(cekici, sifre);
  if (!sifreOk) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }

  cekici.bildirimSeviye = seviye;
  cekici.premiumSmsAktif = seviye >= 2;
  await updateCekici(cekici);

  const etiket = BILDIRIM_SEVIYE_ETIKET[seviye];
  return NextResponse.json({
    bildirimSeviye: seviye,
    bildirimKredi: seviye,
    premiumSmsAktif: seviye >= 2,
    mesaj: `Bildirim paketi güncellendi: ${etiket.baslik} (${seviye} kredi).`,
  });
}
