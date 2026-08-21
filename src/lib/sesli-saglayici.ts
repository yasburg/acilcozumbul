/** Çağrı merkezi ses sağlayıcıları — anahtarlar sunucuda kalır. */

export const SESLI_SAGLAYICILAR = ["fish", "openai", "elevenlabs"] as const;
export type SesliSaglayiciId = (typeof SESLI_SAGLAYICILAR)[number];

export const SESLI_MALIYET_HEADER = "X-Sesli-Maliyet-Usd";

export const OPENAI_REALTIME_MODEL_DEFAULT = "gpt-realtime-2.1";
export const OPENAI_REALTIME_VOICE_DEFAULT = "marin";
export const OPENAI_INPUT_TRANSCRIBE_DEFAULT = "gpt-4o-transcribe";
export const ELEVENLABS_TTS_MODEL_DEFAULT = "eleven_v3";
/** Ücretsiz planda API ile kullanılabilen premade ses — George. Kütüphane sesleri 402 verir. */
export const ELEVENLABS_VOICE_ID_DEFAULT = "JBFqnCBsd6RMkjVDRZzb";

/** Yayınlanmış API birim fiyatları (USD, tahmini gösterim). */
export const SESLI_BIRIM_FIYAT = {
  openaiRealtimeAudioInPerMTok: 32,
  openaiRealtimeAudioCachedPerMTok: 0.4,
  openaiRealtimeAudioOutPerMTok: 64,
  openaiRealtimeTextInPerMTok: 4,
  openaiRealtimeTextOutPerMTok: 24,
  elevenV3Per1kChar: 0.1,
} as const;

export type SesliSaglayiciDurum = {
  id: SesliSaglayiciId;
  ad: string;
  aktif: boolean;
  model: string;
  birim: string;
  canli: boolean;
};

export function sesliSaglayiciParse(v: unknown): SesliSaglayiciId | null {
  if (typeof v !== "string") return null;
  return SESLI_SAGLAYICILAR.includes(v as SesliSaglayiciId)
    ? (v as SesliSaglayiciId)
    : null;
}

export function openaiApiKey(): string {
  return process.env.OPENAI_API_KEY?.trim() ?? "";
}

export function openaiAktif(): boolean {
  return openaiApiKey().length > 0;
}

export function openaiRealtimeModel(): string {
  return (
    process.env.OPENAI_REALTIME_MODEL?.trim() || OPENAI_REALTIME_MODEL_DEFAULT
  );
}

export function openaiRealtimeVoice(): string {
  return (
    process.env.OPENAI_TTS_VOICE?.trim() || OPENAI_REALTIME_VOICE_DEFAULT
  );
}

export function elevenlabsApiKey(): string {
  return process.env.ELEVENLABS_API_KEY?.trim() ?? "";
}

export function elevenlabsVoiceId(): string {
  return (
    process.env.ELEVENLABS_VOICE_ID?.trim() || ELEVENLABS_VOICE_ID_DEFAULT
  );
}

export function elevenlabsTtsModel(): string {
  return (
    process.env.ELEVENLABS_TTS_MODEL?.trim() || ELEVENLABS_TTS_MODEL_DEFAULT
  );
}

export function elevenlabsAktif(): boolean {
  return elevenlabsApiKey().length > 0;
}

export function sesliMaliyetYazi(usd: number, usdTry = 0): string {
  const tl = Number.isFinite(usd) && usd > 0 && usdTry > 0 ? usd * usdTry : 0;
  if (tl <= 0) return "₺0,00";
  const hane = tl < 0.01 ? 4 : 2;
  return `₺${tl.toLocaleString("tr-TR", {
    minimumFractionDigits: hane,
    maximumFractionDigits: hane,
  })}`;
}

export function elevenlabsTtsUsd(metin: string): number {
  const chars = Math.max(1, [...metin.trim()].length);
  return (chars / 1000) * SESLI_BIRIM_FIYAT.elevenV3Per1kChar;
}

export function openaiRealtimeKullanimUsd(usage: {
  input_token_details?: {
    text_tokens?: number;
    audio_tokens?: number;
    cached_tokens?: number;
  };
  output_token_details?: {
    text_tokens?: number;
    audio_tokens?: number;
  };
  input_tokens?: number;
  output_tokens?: number;
}): number {
  const inDet = usage.input_token_details ?? {};
  const outDet = usage.output_token_details ?? {};
  const audioIn = inDet.audio_tokens ?? 0;
  const textIn = inDet.text_tokens ?? 0;
  const cached = inDet.cached_tokens ?? 0;
  const audioOut = outDet.audio_tokens ?? 0;
  const textOut = outDet.text_tokens ?? 0;
  if (audioIn + textIn + audioOut + textOut + cached > 0) {
    return (
      (audioIn * SESLI_BIRIM_FIYAT.openaiRealtimeAudioInPerMTok +
        cached * SESLI_BIRIM_FIYAT.openaiRealtimeAudioCachedPerMTok +
        audioOut * SESLI_BIRIM_FIYAT.openaiRealtimeAudioOutPerMTok +
        textIn * SESLI_BIRIM_FIYAT.openaiRealtimeTextInPerMTok +
        textOut * SESLI_BIRIM_FIYAT.openaiRealtimeTextOutPerMTok) /
      1_000_000
    );
  }
  const input = usage.input_tokens ?? 0;
  const output = usage.output_tokens ?? 0;
  return (
    (input * SESLI_BIRIM_FIYAT.openaiRealtimeAudioInPerMTok +
      output * SESLI_BIRIM_FIYAT.openaiRealtimeAudioOutPerMTok) /
    1_000_000
  );
}

export function sesliMaliyetHeader(usd: number): string {
  return usd.toFixed(6);
}

export function sesliMaliyetHeaderOku(h: Headers | null): number {
  if (!h) return 0;
  const n = Number(h.get(SESLI_MALIYET_HEADER));
  return Number.isFinite(n) && n > 0 ? n : 0;
}
