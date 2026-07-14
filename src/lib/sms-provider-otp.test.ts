import { describe, expect, it } from "vitest";
import { otpMesajAscii } from "./sms-provider";

describe("otpMesajAscii", () => {
  it("Türkçe karakterleri ASCII yapar ve 155 ile keser", () => {
    expect(otpMesajAscii("doğrulama geçerlidir")).toBe("dogrulama gecerlidir");
    expect(otpMesajAscii("a".repeat(200)).length).toBe(155);
  });
});
