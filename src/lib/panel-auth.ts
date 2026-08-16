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

function bytesToBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]!);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function utf8ToBase64Url(s: string): string {
  return bytesToBase64Url(new TextEncoder().encode(s));
}

function base64UrlToUtf8(s: string): string {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmacSha256(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return bytesToBase64Url(sig);
}

function macEsit(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i)! ^ b.charCodeAt(i)!;
  return diff === 0;
}

export async function signPanelSession(email: string): Promise<string> {
  const secret = panelSessionSecret();
  if (!secret) {
    throw new Error("PANEL_SESSION_SECRET tanımlı değil.");
  }
  const role = panelRol(email);
  if (!role) {
    throw new Error("Panel e-postası izinli değil.");
  }
  const payload = utf8ToBase64Url(JSON.stringify({ email, role, ts: Date.now() }));
  const mac = await hmacSha256(secret, payload);
  return `v1.${payload}.${mac}`;
}

export async function parsePanelSession(
  token: string | undefined
): Promise<PanelSession | null> {
  if (!token) return null;
  const secret = panelSessionSecret();
  if (!secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  const payload = parts[1]!;
  const mac = parts[2]!;
  if (!macEsit(mac, await hmacSha256(secret, payload))) return null;
  try {
    const parsed = JSON.parse(base64UrlToUtf8(payload));
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

export async function setPanelSessionCookie(
  response: NextResponse,
  email: string
): Promise<NextResponse> {
  const token = await signPanelSession(email);
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
