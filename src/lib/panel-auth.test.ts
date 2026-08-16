import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parsePanelSession, signPanelSession } from "./panel-auth";

describe("panel oturum çerezi", () => {
  const prevSecret = process.env.PANEL_SESSION_SECRET;
  const prevAdmin = process.env.PANEL_ADMIN_EMAILS;

  beforeEach(() => {
    process.env.PANEL_SESSION_SECRET = "test-panel-session-secret-32b";
    process.env.PANEL_ADMIN_EMAILS = "admin@example.com";
  });

  afterEach(() => {
    process.env.PANEL_SESSION_SECRET = prevSecret;
    process.env.PANEL_ADMIN_EMAILS = prevAdmin;
  });

  it("imzalı çerezi doğrular", async () => {
    const token = await signPanelSession("admin@example.com");
    expect(token.startsWith("v1.")).toBe(true);
    expect(await parsePanelSession(token)).toEqual({
      email: "admin@example.com",
      role: "admin",
    });
  });

  it("imzasız eski base64 JSON çerezi reddeder", async () => {
    const sahte = btoa(
      JSON.stringify({
        email: "admin@example.com",
        role: "admin",
        ts: Date.now(),
      })
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(await parsePanelSession(sahte)).toBeNull();
  });

  it("bozulmuş imzayı reddeder", async () => {
    const token = await signPanelSession("admin@example.com");
    const parts = token.split(".");
    parts[2] = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    expect(await parsePanelSession(parts.join("."))).toBeNull();
  });

  it("secret yoksa imzalama hata verir ve parse reddeder", async () => {
    delete process.env.PANEL_SESSION_SECRET;
    await expect(signPanelSession("admin@example.com")).rejects.toThrow(
      /PANEL_SESSION_SECRET/
    );
    expect(await parsePanelSession("v1.abc.def")).toBeNull();
  });
});
