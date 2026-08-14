import { NextRequest, NextResponse } from "next/server";
import { sendVoiceByAudioId } from "@/lib/netgsm-sesli";
import {
  sesliMesajSablonBul,
  sesliMesajSablonlari,
  type SesliMesajSablonId,
} from "@/lib/sesli-mesaj";
import { telefonGecerliMi, telefonNormalize } from "@/lib/telefon";

export async function GET() {
  return NextResponse.json({
    sablonlar: sesliMesajSablonlari(),
  });
}

type Body = {
  sablonId?: string;
  telefon?: string;
  /** Şablonda yoksa / override */
  audioId?: string;
};

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const sablonId = body.sablonId?.trim() as SesliMesajSablonId | undefined;
  if (!sablonId || !sesliMesajSablonBul(sablonId)) {
    return NextResponse.json(
      {
        error:
          "Geçerli bir şablon seçin (musteri_talep_alindi | cekici_yeni_talep | cekici_yetersiz_kredi | cekici_ihale_kazandi).",
      },
      { status: 400 }
    );
  }

  const telefon = telefonNormalize(body.telefon ?? "");
  if (!telefonGecerliMi(telefon)) {
    return NextResponse.json(
      { error: "Geçerli bir Türkiye cep telefonu girin (05XX…)." },
      { status: 400 }
    );
  }

  const sablon = sesliMesajSablonBul(sablonId)!;
  const audioId = (body.audioId?.trim() || sablon.audioId || "").trim();
  if (!/^\d+$/.test(audioId)) {
    return NextResponse.json(
      {
        error:
          "AudioID gerekli. Çekici kaydını Netgsm’e yükleyip ID’yi girin veya NETGSM_VOICE_CEKICI_AUDIO_ID tanımlayın.",
      },
      { status: 400 }
    );
  }

  const sonuc = await sendVoiceByAudioId({
    telefon,
    audioId,
  });

  if (!sonuc.basarili) {
    return NextResponse.json(
      {
        ok: false,
        error: sonuc.hata ?? "Sesli mesaj gönderilemedi.",
        kod: sonuc.kod,
        raw: sonuc.raw,
        sablonId,
        audioId,
        telefon,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    sablonId,
    label: sablon.label,
    audioId,
    telefon,
    bulkid: sonuc.bulkid,
    kod: sonuc.kod,
  });
}
