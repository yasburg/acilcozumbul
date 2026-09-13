import { describe, expect, it } from "vitest";
import { sdpTeklifHazirla } from "./openai-ses";

describe("sdpTeklifHazirla", () => {
  it("satır sonlarını CRLF yapıp kapanış satırı ekler", () => {
    const out = sdpTeklifHazirla("v=0\no=- 1 1 IN IP4 127.0.0.1\ns=-");
    expect(out.startsWith("v=0\r\n")).toBe(true);
    expect(out.endsWith("\r\n")).toBe(true);
    expect(out.includes("\n") && !out.replace(/\r\n/g, "").includes("\n")).toBe(true);
  });
});
