import { NextRequest, NextResponse } from "next/server";
import { fishAudioAktif, fishAudioTtsMp3, FishAudioHata } from "@/lib/fish-audio";
import { elevenlabsTtsMp3, ElevenLabsHata } from "@/lib/elevenlabs-ses";
import {
  elevenlabsAktif,
  SESLI_MALIYET_HEADER,
  sesliMaliyetHeader,
  sesliSaglayiciParse,
} from "@/lib/sesli-saglayici";

export async function POST(request: NextRequest) {
  let text = "";
  let saglayici = sesliSaglayiciParse("fish") ?? "fish";
  try {
    const body = (await request.json()) as { text?: string; saglayici?: unknown };
    text = typeof body.text === "string" ? body.text : "";
    saglayici = sesliSaglayiciParse(body.saglayici) ?? "fish";
  } catch {
    return NextResponse.json({ error: "Metin gerekli." }, { status: 400 });
  }

  try {
    if (saglayici === "elevenlabs") {
      if (!elevenlabsAktif()) {
        return NextResponse.json(
          { error: "ELEVENLABS_API_KEY tanımlı değil." },
          { status: 503 }
        );
      }
      const { mp3, maliyetUsd } = await elevenlabsTtsMp3(text);
      return new NextResponse(Buffer.from(mp3), {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
          [SESLI_MALIYET_HEADER]: sesliMaliyetHeader(maliyetUsd),
        },
      });
    }
    if (!fishAudioAktif()) {
      return NextResponse.json(
        { error: "FISH_AUDIO_API_KEY tanımlı değil." },
        { status: 503 }
      );
    }
    const mp3 = await fishAudioTtsMp3(text);
    return new NextResponse(Buffer.from(mp3), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        [SESLI_MALIYET_HEADER]: sesliMaliyetHeader(0),
      },
    });
  } catch (e) {
    const mesaj =
      e instanceof FishAudioHata || e instanceof ElevenLabsHata
        ? e.message
        : "Ses üretilemedi.";
    const status =
      e instanceof FishAudioHata || e instanceof ElevenLabsHata ? e.status : 502;
    return NextResponse.json({ error: mesaj }, { status });
  }
}
