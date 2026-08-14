import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { panelEpostaIzinli, panelRol } from "./panel-yetki";

const PANEL_SESSION_COOKIE = "acb_panel_session";

export interface PanelSession {
  email: string;
  role: "admin" | "muhasebe";
}

export function signPanelSession(email: string): string {
  const role = panelRol(email);
  const data = JSON.stringify({ email, role, ts: Date.now() });
  return Buffer.from(data).toString("base64url");
}

export function parsePanelSession(token: string | undefined): PanelSession | null {
  if (!token) return null;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email && panelEpostaIzinli(parsed.email)) {
      const role = panelRol(parsed.email);
      if (!role) return null;
      return {
        email: parsed.email,
        role,
      };
    }
  } catch {}
  return null;
}

export async function getPanelSession(request?: NextRequest): Promise<PanelSession | null> {
  const token = request
    ? request.cookies.get(PANEL_SESSION_COOKIE)?.value
    : (await cookies()).get(PANEL_SESSION_COOKIE)?.value;
  return parsePanelSession(token);
}

export function setPanelSessionCookie(response: NextResponse, email: string): NextResponse {
  const token = signPanelSession(email);
  response.cookies.set(PANEL_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
