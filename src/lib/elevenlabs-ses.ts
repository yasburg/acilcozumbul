import {
  ELEVENLABS_VOICE_ID_DEFAULT,
  elevenlabsApiKey,
  elevenlabsTtsModel,
  elevenlabsTtsUsd,
  elevenlabsVoiceId,
} from "./sesli-saglayici";

export class ElevenLabsHata extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ElevenLabsHata";
    this.status = status;
  }
}

export async function elevenlabsTtsMp3(text: string): Promise<{
  mp3: Uint8Array;
  maliyetUsd: number;
}> {
  const key = elevenlabsApiKey();
  if (!key) throw new ElevenLabsHata(503, "ELEVENLABS_API_KEY tanımlı değil.");
  const metin = text.trim();
  if (!metin) throw new ElevenLabsHata(400, "Boş metin seslendirilemez.");
  const voice = elevenlabsVoiceId();
  const res = await ttsIste(key, voice, metin);
  if (res.ok) {
    return {
      mp3: new Uint8Array(await res.arrayBuffer()),
      maliyetUsd: elevenlabsTtsUsd(metin),
    };
  }
  const ham = await res.text();
  const ozet = elevenlabsHataOzet(ham);
  const premade = ELEVENLABS_VOICE_ID_DEFAULT;
  if (res.status === 402 && voice !== premade) {
    const tekrar = await ttsIste(key, premade, metin);
    if (tekrar.ok) {
      return {
        mp3: new Uint8Array(await tekrar.arrayBuffer()),
        maliyetUsd: elevenlabsTtsUsd(metin),
      };
    }
  }
  throw new ElevenLabsHata(res.status, `ElevenLabs ${res.status}: ${ozet}`);
}

async function ttsIste(key: string, voice: string, metin: string): Promise<Response> {
  return fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: metin,
        model_id: elevenlabsTtsModel(),
      }),
    }
  );
}

function elevenlabsHataOzet(t: string): string {
  let ozet = t.slice(0, 240);
  try {
    const j = JSON.parse(t) as { detail?: { message?: string } | string };
    if (typeof j.detail === "string") ozet = j.detail;
    else if (j.detail?.message) ozet = j.detail.message;
  } catch {
    /* düz metin */
  }
  return ozet;
}
