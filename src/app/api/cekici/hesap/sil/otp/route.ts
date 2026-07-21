import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { cekiciGirisSifreKontrol } from "@/lib/cekici-auth";
import {
  cekiciHesapSilOtpOlustur,
  hesapSilOnayMetniGecerliMi,
} from "@/lib/cekici-hesap-sil-otp";
import { sendSms } from "@/lib/sms-provider";
import { telefonMaskele } from "@/lib/telefon";
import { ensureSeedData } from "@/lib/seed";

/** Hesap silme için XML (toplu) SMS ile doğrulama kodu gönder */
export async function POST(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const sifre = String((body as { sifre?: string }).sifre ?? "").trim();
  const onayMetni = String((body as { onayMetni?: string }).onayMetni ?? "");

  if (!hesapSilOnayMetniGecerliMi(onayMetni)) {
    return NextResponse.json(
      { error: "Onay metnini doğru yazın." },
      { status: 400 }
    );
  }
  if (!sifre) {
    return NextResponse.json(
      { error: "Şifrenizi girin." },
      { status: 400 }
    );
  }

  const sifreOk = await cekiciGirisSifreKontrol(cekici, sifre);
  if (!sifreOk) {
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  }

  let sonuc: Awaited<ReturnType<typeof cekiciHesapSilOtpOlustur>>;
  try {
    sonuc = await cekiciHesapSilOtpOlustur(cekici.telefon);
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Kod oluşturulamadı.";
    if (/cekici_hesap_sil_otp|schema cache|does not exist/i.test(mesaj)) {
      return NextResponse.json(
        {
          error:
            "Hesap silme SMS tablosu yok. supabase/migrations/028_cekici_hesap_sil_otp.sql dosyasını çalıştırın.",
        },
        { status: 503 }
      );
    }
    throw e;
  }

  if (!sonuc.ok) {
    return NextResponse.json(
      {
        error: sonuc.hata,
        yenidenGonderSn: sonuc.yenidenGonderSn,
      },
      { status: sonuc.yenidenGonderSn ? 429 : 400 }
    );
  }

  const smsMesaj = `ACIL COZUM BUL: Hesap silme kodunuz ${sonuc.kod}. 5 dk gecerli. Bu islemi siz yapmadiysaniz dikkate almayin.`;
  const sms = await sendSms(sonuc.telefon, smsMesaj, {
    aliciTipi: "cekici",
    cekiciId: cekici.id,
    krediDus: false,
    kanal: "xml",
    talepId: "hesap-sil",
  });

  const bodyOut: Record<string, unknown> = {
    yenidenGonderSn: sonuc.yenidenGonderSn,
    smsGonderildi: sms.basarili,
    smsKanal: "xml",
    telefon: telefonMaskele(sonuc.telefon),
  };

  if (sms.basarili) {
    bodyOut.mesaj = `${telefonMaskele(sonuc.telefon)} numarasına SMS kodu gönderildi.`;
    return NextResponse.json(bodyOut);
  }

  if (sonuc.gelistirmeKodu) {
    bodyOut.gelistirmeKodu = sonuc.gelistirmeKodu;
    bodyOut.mesaj =
      "SMS şu an gitmedi (test). Ekrandaki geliştirme kodunu kullanın.";
    return NextResponse.json(bodyOut);
  }

  return NextResponse.json(
    {
      error: "SMS gönderilemedi. Biraz sonra tekrar deneyin.",
      smsHatasi: sms.hata,
    },
    { status: 503 }
  );
}
