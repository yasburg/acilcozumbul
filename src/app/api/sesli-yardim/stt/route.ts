import { NextRequest, NextResponse } from "next/server";
import { fishAudioAktif, fishAudioStt, FishAudioHata } from "@/lib/fish-audio";

export async function POST(request: NextRequest) {
  if (!fishAudioAktif()) {
    return NextResponse.json(
      { error: "FISH_AUDIO_API_KEY tanımlı değil." },
      { status: 503 }
    );
  }
  const form = await request.formData();
  const audio = form.get("audio");
  if (!(audio instanceof Blob) || audio.size < 32) {
    return NextResponse.json({ error: "Ses kaydı gerekli." }, { status: 400 });
  }
  const ad =
    audio instanceof File && audio.name.trim()
      ? audio.name
      : "konusma.webm";
  try {
    const text = await fishAudioStt(audio, ad);
    return NextResponse.json({ text });
  } catch (e) {
    if (e instanceof FishAudioHata && e.status === 402) {
      return NextResponse.json(
        {
          error:
            "Fish STT ücretli (API kredisi). Konuşmayı tarayıcı tanır; bu endpoint gerekmez.",
        },
        { status: 402 }
      );
    }
    const mesaj = e instanceof FishAudioHata ? e.message : "Çözümleme başarısız.";
    const status = e instanceof FishAudioHata ? e.status : 502;
    return NextResponse.json({ error: mesaj }, { status });
  }
}
