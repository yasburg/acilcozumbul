import { describe, expect, it } from "vitest";
import { parseJsonYanit } from "./api-json";
import { MIGRATION_007_MESAJ } from "./supabase/bolge-schema";

describe("F8 / api-json", () => {
  it("F8: boş 503 gövde → anlamlı hata (migration)", async () => {
    const res = new Response("", { status: 503 });
    await expect(parseJsonYanit(res)).rejects.toThrow(/503/);
  });

  it("geçerli JSON parse", async () => {
    const res = new Response(JSON.stringify({ ok: true }), { status: 200 });
    const data = await parseJsonYanit<{ ok: boolean }>(res);
    expect(data.ok).toBe(true);
  });

  it("migration mesajı tanımlı", () => {
    expect(MIGRATION_007_MESAJ).toContain("007");
  });
});
