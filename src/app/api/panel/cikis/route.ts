import { NextResponse } from "next/server";
import { clearPanelSessionCookie } from "@/lib/panel-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  return clearPanelSessionCookie(res);
}
