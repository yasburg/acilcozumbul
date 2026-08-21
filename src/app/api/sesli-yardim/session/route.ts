import { NextResponse } from "next/server";
import { fishAudioAktif, fishAudioTtsModel } from "@/lib/fish-audio";
import { openaiRealtimeClientSecret, OpenAiHata } from "@/lib/openai-ses";
import { smsYalnizTesterCekicilerMi } from "@/lib/sms";
import {
  elevenlabsAktif,
  elevenlabsTtsModel,
  openaiAktif,
  openaiRealtimeModel,
  sesliMaliyetYazi,
  sesliSaglayiciParse,
  type SesliSaglayiciDurum,
} from "@/lib/sesli-saglayici";
import { usdTryKuruAl } from "@/lib/usd-try";

function saglayicilar(usdTry: number): SesliSaglayiciDurum[] {
  return [
    {
      id: "fish",
      ad: "Fish Audio",
      aktif: fishAudioAktif(),
      model: fishAudioTtsModel(),
      birim: "ücretsiz TTS",
      canli: false,
    },
    {
      id: "openai",
      ad: "ChatGPT",
      aktif: openaiAktif(),
      model: openaiRealtimeModel(),
      birim: `~${sesliMaliyetYazi(0.1, usdTry)}/dk canlı`,
      canli: true,
    },
    {
      id: "elevenlabs",
      ad: "ElevenLabs",
      aktif: elevenlabsAktif(),
      model: elevenlabsTtsModel(),
      birim: `${sesliMaliyetYazi(0.1, usdTry)}/1K karakter`,
      canli: false,
    },
  ];
}

export async function GET() {
  let usdTry = 0;
  let usdTryKaynak = "";
  try {
    const kur = await usdTryKuruAl();
    usdTry = kur.oran;
    usdTryKaynak = kur.kaynak;
  } catch {
    /* gösterim ₺0,00 kalır */
  }
  return NextResponse.json({
    testerOnly: smsYalnizTesterCekicilerMi(),
    saglayicilar: saglayicilar(usdTry),
    usdTry,
    usdTryKaynak,
  });
}

export async function POST(request: Request) {
  let saglayici = sesliSaglayiciParse(
    (await request.json().catch(() => ({})) as { saglayici?: unknown }).saglayici
  );
  if (!saglayici) saglayici = "openai";

  if (saglayici === "openai") {
    if (!openaiAktif()) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY tanımlı değil." },
        { status: 503 }
      );
    }
    try {
      const oturum = await openaiRealtimeClientSecret();
      return NextResponse.json({ tur: "openai-realtime", ...oturum });
    } catch (e) {
      const mesaj = e instanceof OpenAiHata ? e.message : "Oturum açılamadı.";
      const status = e instanceof OpenAiHata ? e.status : 502;
      return NextResponse.json({ error: mesaj }, { status });
    }
  }

  if (saglayici === "fish" && !fishAudioAktif()) {
    return NextResponse.json(
      { error: "FISH_AUDIO_API_KEY tanımlı değil." },
      { status: 503 }
    );
  }
  if (saglayici === "elevenlabs" && !elevenlabsAktif()) {
    return NextResponse.json(
      { error: "ELEVENLABS_API_KEY tanımlı değil." },
      { status: 503 }
    );
  }
  return NextResponse.json({ tur: "tur-bazli", saglayici });
}
