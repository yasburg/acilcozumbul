"use client";

import type { MusteriFunnelOlayMeta } from "./musteri-funnel-olay";
import { musteriFunnelOlay } from "./musteri-funnel";

export function musteriFunnelSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "musteri_funnel_sid";
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

const FUNNEL_ID_KEY = "musteri_funnel_id";

/** Bekle / OTP adımlarında hangi A/B funnel’dan gelindiğini tutar */
export function musteriFunnelIdKaydet(funnel: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(FUNNEL_ID_KEY, funnel);
  } catch {
    /* ignore */
  }
}

export function musteriFunnelIdOku(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage.getItem(FUNNEL_ID_KEY)?.trim().toLowerCase();
    return v || null;
  } catch {
    return null;
  }
}

export function musteriFunnelIdTalepKaydet(
  talepId: string,
  funnel: string
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`acil_bekle_funnel_${talepId}`, funnel);
    musteriFunnelIdKaydet(funnel);
  } catch {
    /* ignore */
  }
}

export function musteriFunnelIdTalepOku(talepId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = sessionStorage
      .getItem(`acil_bekle_funnel_${talepId}`)
      ?.trim()
      .toLowerCase();
    return v || musteriFunnelIdOku();
  } catch {
    return musteriFunnelIdOku();
  }
}

function birKezAnahtar(funnel: string, olay: string): string {
  return `musteri_funnel_once:${funnel}:${olay}`;
}

export function musteriFunnelOlayBirKezMi(
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

/** Eski funnel_events tablosuna da yazılan çekirdek olaylar */
const ESKI_DB_OLAYLAR = new Set([
  "form_basla",
  "otp_gonder",
  "otp_dogrulandi",
  "talep_olustur",
]);

export async function musteriFunnelOlayGonder(
  funnel: string,
  olay: string,
  ekstra?: {
    telefon?: string;
    talepId?: string;
    meta?: MusteriFunnelOlayMeta;
    birKez?: boolean;
    /** PostHog/GA props */
    props?: Record<string, unknown>;
    /** PostHog’a da yaz (varsayılan true) */
    analitik?: boolean;
  }
): Promise<void> {
  if (ekstra?.birKez) {
    if (musteriFunnelOlayBirKezMi(funnel, olay)) return;
    birKezIsaretle(funnel, olay);
  }

  const sessionId = musteriFunnelSessionId();
  const telefon = ekstra?.telefon;
  const props = { funnel, ...(ekstra?.props ?? {}) };

  if (ekstra?.analitik !== false) {
    musteriFunnelOlay(olay, props);
  }

  try {
    await fetch("/api/musteri/funnel-olay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        funnel,
        olay,
        sessionId,
        telefon,
        talepId: ekstra?.talepId,
        meta: ekstra?.meta,
      }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }

  /* Panel özetindeki eski huni için geriye uyum */
  const eskiOlay =
    olay === "goruldu"
      ? "form_basla"
      : ESKI_DB_OLAYLAR.has(olay)
        ? olay
        : null;
  if (eskiOlay) {
    try {
      await fetch("/api/musteri/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          olay: eskiOlay,
          telefon,
          talepId: ekstra?.talepId,
        }),
        keepalive: true,
      });
    } catch {
      /* ignore */
    }
  }
}

export function musteriFunnelOlayBirKez(
  funnel: string,
  olay: string,
  ekstra?: {
    telefon?: string;
    talepId?: string;
    meta?: MusteriFunnelOlayMeta;
    props?: Record<string, unknown>;
    analitik?: boolean;
  }
): void {
  void musteriFunnelOlayGonder(funnel, olay, { ...ekstra, birKez: true });
}
