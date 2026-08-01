"use client";

import type { KayitFunnelAlan, KayitFunnelOlayMeta } from "./kayit-funnel-olay";

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

function birKezAnahtar(funnel: string, olay: string): string {
  return `kayit_funnel_once:${funnel}:${olay}`;
}

export function kayitFunnelOlayBirKezMi(
  funnel: string,
  olay: string
): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(birKezAnahtar(funnel, olay)) === "1";
  } catch {
    return false;
  }
}

function birKezIsaretle(funnel: string, olay: string): void {
  try {
    sessionStorage.setItem(birKezAnahtar(funnel, olay), "1");
  } catch {
    /* ignore */
  }
}

export async function kayitFunnelOlayGonder(
  funnel: string,
  olay: string,
  ekstra?: { cekiciId?: string; meta?: KayitFunnelOlayMeta; birKez?: boolean }
): Promise<void> {
  if (ekstra?.birKez) {
    if (kayitFunnelOlayBirKezMi(funnel, olay)) return;
    birKezIsaretle(funnel, olay);
  }
  try {
    await fetch("/api/kayit/funnel-olay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        funnel,
        olay,
        sessionId: kayitFunnelSessionId(),
        cekiciId: ekstra?.cekiciId,
        meta: ekstra?.meta,
      }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}

/** Session başına bir kez */
export function kayitFunnelOlayBirKez(
  funnel: string,
  olay: string,
  ekstra?: { cekiciId?: string; meta?: KayitFunnelOlayMeta }
): void {
  void kayitFunnelOlayGonder(funnel, olay, { ...ekstra, birKez: true });
}

export function kayitFunnelAlanFocus(
  funnel: string,
  alan: KayitFunnelAlan
): void {
  kayitFunnelOlayBirKez(funnel, `field_focus_${alan}`, {
    meta: { alan },
  });
}

export function kayitFunnelAlanDoldu(
  funnel: string,
  alan: KayitFunnelAlan,
  deger: string
): void {
  if (!deger.trim()) return;
  kayitFunnelOlayBirKez(funnel, `field_filled_${alan}`, {
    meta: { alan },
  });
}
