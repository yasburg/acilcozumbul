import { describe, expect, it } from "vitest";
import {
  elevenlabsTtsUsd,
  openaiRealtimeKullanimUsd,
  sesliMaliyetYazi,
  sesliSaglayiciParse,
  OPENAI_REALTIME_MODEL_DEFAULT,
} from "./sesli-saglayici";

describe("sesli sağlayıcı", () => {
  it("gpt-realtime-2.1 varsayılan canlı model", () => {
    expect(OPENAI_REALTIME_MODEL_DEFAULT).toBe("gpt-realtime-2.1");
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

  it("ElevenLabs v3 karakter ücreti", () => {
    expect(elevenlabsTtsUsd("a".repeat(1000))).toBeCloseTo(0.1, 6);
  });

  it("küçük tutarı TL olarak yazar", () => {
    expect(sesliMaliyetYazi(0, 47.9662)).toBe("₺0,00");
    expect(sesliMaliyetYazi(0.1, 47.9662)).toBe("₺4,80");
  });
});
