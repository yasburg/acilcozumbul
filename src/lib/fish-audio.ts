/** Fish Audio Open API — anahtar ve TTS modeli sunucuda kalır. */

export const FISH_AUDIO_API_BASE = "https://api.fish.audio";
export const FISH_AUDIO_TTS_MODEL_DEFAULT = "s2.1-pro-free";
export const FISH_AUDIO_AGENT_ADI = "ACB Sesli Yardım";

export function fishAudioApiKey(): string {
  return process.env.FISH_AUDIO_API_KEY?.trim() ?? "";
}

export function fishAudioTtsModel(): string {
  return (
    process.env.FISH_AUDIO_TTS_MODEL?.trim() || FISH_AUDIO_TTS_MODEL_DEFAULT
  );
}

export function fishAudioAgentIdEnv(): string {
  return process.env.FISH_AUDIO_AGENT_ID?.trim() ?? "";
}

export function fishAudioVoiceId(): string {
  return process.env.FISH_AUDIO_VOICE_ID?.trim() ?? "";
}

export function fishAudioAktif(): boolean {
  return fishAudioApiKey().length > 0;
}

export class FishAudioHata extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string, message?: string) {
    super(message || `Fish Audio ${status}`);
    this.name = "FishAudioHata";
    this.status = status;
    this.body = body;
  }
}

export async function fishAudioIstek<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const key = fishAudioApiKey();
  if (!key) {
    throw new FishAudioHata(503, "", "FISH_AUDIO_API_KEY tanımlı değil.");
  }
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${key}`);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${FISH_AUDIO_API_BASE}${path}`, {
    ...init,
    headers,
  });
  const text = await res.text();
  if (!res.ok) {
    let ozet = text.slice(0, 240);
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j.message) ozet = j.message;
    } catch {
      /* düz metin */
    }
    throw new FishAudioHata(res.status, text, `Fish Audio ${res.status}: ${ozet}`);
  }
  if (!text.trim()) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new FishAudioHata(res.status, text, "Fish Audio yanıtı okunamadı.");
  }
}

export async function fishAudioTtsMp3(text: string): Promise<Uint8Array> {
  const key = fishAudioApiKey();
  if (!key) {
    throw new FishAudioHata(503, "", "FISH_AUDIO_API_KEY tanımlı değil.");
  }
  const metin = text.trim();
  if (!metin) {
    throw new FishAudioHata(400, "", "Boş metin seslendirilemez.");
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    model: fishAudioTtsModel(),
  };
  const body: Record<string, unknown> = {
    text: metin,
    format: "mp3",
  };
  const voice = fishAudioVoiceId();
  if (voice) body.reference_id = voice;

  const res = await fetch(`${FISH_AUDIO_API_BASE}/v1/tts`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    let ozet = t.slice(0, 240);
    try {
      const j = JSON.parse(t) as { message?: string };
      if (j.message) ozet = j.message;
    } catch {
      /* düz metin */
    }
    throw new FishAudioHata(res.status, t, `Fish Audio ${res.status}: ${ozet}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

export async function fishAudioStt(
  audio: Blob,
  dosyaAdi: string
): Promise<string> {
  const key = fishAudioApiKey();
  if (!key) {
    throw new FishAudioHata(503, "", "FISH_AUDIO_API_KEY tanımlı değil.");
  }
  const fd = new FormData();
  fd.append("audio", audio, dosyaAdi);
  fd.append("language", "tr");
  fd.append("ignore_timestamps", "true");
  const res = await fetch(`${FISH_AUDIO_API_BASE}/v1/asr`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
    },
    body: fd,
  });
  const text = await res.text();
  if (!res.ok) {
    let ozet = text.slice(0, 240);
    try {
      const j = JSON.parse(text) as { message?: string };
      if (j.message) ozet = j.message;
    } catch {
      /* düz metin */
    }
    throw new FishAudioHata(res.status, text, `Fish Audio ${res.status}: ${ozet}`);
  }
  const data = JSON.parse(text) as { text?: string };
  return (data.text ?? "").trim();
}

