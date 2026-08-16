import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { panelEpostaIzinli, panelRol } from "./panel-yetki";

const PANEL_SESSION_COOKIE = "acb_panel_session";
const PANEL_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface PanelSession {
  email: string;
  role: "admin" | "muhasebe";
}

function panelSessionSecret(): string {
  return process.env.PANEL_SESSION_SECRET?.trim() ?? "";
}

function hmacSha256(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function macEsit(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function signPanelSession(email: string): string {
  const secret = panelSessionSecret();
  if (!secret) {
    throw new Error("PANEL_SESSION_SECRET tanımlı değil.");
  }
  const role = panelRol(email);
  if (!role) {
    throw new Error("Panel e-postası izinli değil.");
  }
  const payload = Buffer.from(
    JSON.stringify({ email, role, ts: Date.now() })
  ).toString("base64url");
  const mac = hmacSha256(secret, payload);
  return `v1.${payload}.${mac}`;
}

export function parsePanelSession(
  token: string | undefined
): PanelSession | null {
  if (!token) return null;
  const secret = panelSessionSecret();
  if (!secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  const payload = parts[1]!;
  const mac = parts[2]!;
  if (!macEsit(mac, hmacSha256(secret, payload))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (!parsed?.email || typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > PANEL_SESSION_MAX_AGE_MS) return null;
    if (!panelEpostaIzinli(parsed.email)) return null;
    const role = panelRol(parsed.email);
    if (!role) return null;
    return { email: parsed.email, role };
  } catch {
    return null;
  }
}

export async function getPanelSession(
  request?: NextRequest
): Promise<PanelSession | null> {
  const token = request
    ? request.cookies.get(PANEL_SESSION_COOKIE)?.value
    : (await cookies()).get(PANEL_SESSION_COOKIE)?.value;
  return parsePanelSession(token);
}

export function setPanelSessionCookie(
  response: NextResponse,
  email: string
): NextResponse {
  const token = signPanelSession(email);
  response.cookies.set(PANEL_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}

export function clearPanelSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(PANEL_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
