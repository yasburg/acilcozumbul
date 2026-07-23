"use client";

export function kayitFunnelSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "kayit_funnel_sid";
  try {
    let id = sessionStorage.getItem(key);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `s_${Date.now()}`;
  }
}

export async function kayitFunnelOlayGonder(
  funnel: string,
  olay: string,
  ekstra?: { cekiciId?: string }
): Promise<void> {
  try {
    await fetch("/api/kayit/funnel-olay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        funnel,
        olay,
        sessionId: kayitFunnelSessionId(),
        cekiciId: ekstra?.cekiciId,
      }),
    });
  } catch {
    /* ignore */
  }
}
