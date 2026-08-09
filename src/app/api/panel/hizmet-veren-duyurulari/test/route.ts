import { NextResponse } from "next/server";
import {
  TOPLU_SMS_ADMIN_TEST_TELEFON,
} from "@/lib/toplu-sms-admin-test";
import {
  duyuruSmsParcalariniGonderimSirasi,
  DUYURU_SMS_PARCA_BEKLEME_MS,
} from "@/lib/hizmet-veren-duyuru";
import { netgsmSmsMesajGecerliMi } from "@/lib/sms-karakter";
import { sendPanelTopluSms, smsDurumu } from "@/lib/sms-provider";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";

function bekle(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function panelKullanici() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) return null;
  return user;
}

/** Önizleme sonrası admin test numarasına anında SMS */
export async function POST(request: Request) {
  if (!(await panelKullanici())) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  let body: { mesajlar?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const ham = Array.isArray(body.mesajlar) ? body.mesajlar : [];
  const mesajlar = ham
    .filter((m): m is string => typeof m === "string")
    .map((m) => m.trim())
    .filter(Boolean);

  if (mesajlar.length === 0) {
    return NextResponse.json({ error: "Gönderilecek SMS yok." }, { status: 400 });
  }
  if (mesajlar.length > 3) {
    return NextResponse.json(
      { error: "En fazla 3 SMS parçası gönderilebilir." },
      { status: 400 }
    );
  }

  for (const mesaj of mesajlar) {
    const kontrol = netgsmSmsMesajGecerliMi(mesaj);
    if (!kontrol.gecerli) {
      return NextResponse.json(
        { error: kontrol.hata ?? "Mesaj geçersiz." },
        { status: 400 }
      );
    }
  }

  const durum = smsDurumu();
  if (!durum.gercekGonderim) {
    return NextResponse.json(
      {
        error:
          "Netgsm yapılandırılmamış. NETGSM_USERCODE / PASSWORD / MSGHEADER gerekli.",
      },
      { status: 503 }
    );
  }

  const telefon = TOPLU_SMS_ADMIN_TEST_TELEFON;
  const sonuclar: Array<{
    sira: number;
    basarili: boolean;
    hata?: string;
  }> = [];

  /* SMS 1 → 2 → 3; parçalar arası bekleme sıranın bozulmasını azaltır */
  const gonderim = duyuruSmsParcalariniGonderimSirasi(mesajlar);
  for (let i = 0; i < gonderim.length; i++) {
    const { metin, sira } = gonderim[i]!;
    const sonuc = await sendPanelTopluSms([telefon], metin);
    const bir = sonuc.sonuclar[0];
    sonuclar.push({
      sira,
      basarili: Boolean(bir?.basarili),
      hata: bir?.hata,
    });
    if (i < gonderim.length - 1) {
      await bekle(DUYURU_SMS_PARCA_BEKLEME_MS);
    }
  }

  sonuclar.sort((a, b) => a.sira - b.sira);

  const basarili = sonuclar.filter((s) => s.basarili).length;
  const basarisiz = sonuclar.length - basarili;

  if (basarili === 0) {
    return NextResponse.json(
      {
        error: sonuclar[0]?.hata ?? "Test SMS gönderilemedi.",
        telefon,
        sonuclar,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    telefon,
    basarili,
    basarisiz,
    smsAdet: mesajlar.length,
    sonuclar,
  });
}
