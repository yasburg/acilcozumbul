import { describe, expect, it } from "vitest";
import {
  elevenlabsTtsUsd,
  openaiLiveDkUsd,
  openaiLunaKullanimUsd,
  openaiLiveDakikaTahminiUsd,
  openaiRealtimeKullanimUsd,
  sesliMaliyetYazi,
  sesliSaglayiciParse,
  OPENAI_LIVE_BACKEND_DEFAULT,
  OPENAI_REALTIME_MODEL_DEFAULT,
} from "./sesli-saglayici";

describe("sesli sağlayıcı", () => {
  it("gpt-live-1 varsayılan canlı model", () => {
    expect(OPENAI_REALTIME_MODEL_DEFAULT).toBe("gpt-live-1");
  });

  it("gpt-5.6-luna varsayılan araç modeli", () => {
    expect(OPENAI_LIVE_BACKEND_DEFAULT).toBe("gpt-5.6-luna");
  });

  it("sağlayıcı adını doğrular", () => {
    expect(sesliSaglayiciParse("openai")).toBe("openai");
    expect(sesliSaglayiciParse("hayir")).toBeNull();
  });

  it("Realtime kullanımından USD hesaplar", () => {
    const usd = openaiRealtimeKullanimUsd({
      input_token_details: { audio_tokens: 600, text_tokens: 0, cached_tokens: 0 },
      output_token_details: { audio_tokens: 1200, text_tokens: 0 },
    });
    expect(usd).toBeCloseTo(0.0192 + 0.0768, 4);
  });

  it("GPT-Live dakikalık ücreti saniyeden hesaplar", () => {
    expect(openaiLiveDkUsd(60)).toBeCloseTo(0.05, 6);
    expect(openaiLiveDkUsd(15)).toBeCloseTo(0.0125, 6);
  });

  it("Luna token ücretini hesaplar", () => {
    expect(
      openaiLunaKullanimUsd({ input_tokens: 1_000_000, output_tokens: 1_000_000 })
    ).toBeCloseTo(1.4, 6);
    expect(openaiLunaKullanimUsd({ input_tokens: 1000, output_tokens: 500 })).toBeCloseTo(
      0.0008,
      6
    );
  });

  it("dakika tahminine Luna ekler", () => {
    expect(openaiLiveDakikaTahminiUsd()).toBeCloseTo(0.054, 6);
  });

  it("ElevenLabs v3 karakter ücreti", () => {
    expect(elevenlabsTtsUsd("a".repeat(1000))).toBeCloseTo(0.1, 6);
  });

  it("küçük tutarı TL olarak yazar", () => {
    expect(sesliMaliyetYazi(0, 47.9662)).toBe("₺0,00");
    expect(sesliMaliyetYazi(0.1, 47.9662)).toBe("₺4,80");
  });
});
