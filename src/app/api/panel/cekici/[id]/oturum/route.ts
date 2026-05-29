import { NextResponse } from "next/server";
import { getCekiciById } from "@/lib/db";
import { CEKICI_COOKIE } from "@/lib/auth";

/** Yönetim panelinden çekici hesabına geçiş (çerez) */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cekici = await getCekiciById(id);
  if (!cekici) {
    return NextResponse.json({ error: "Çekici bulunamadı." }, { status: 404 });
  }

  const response = NextResponse.json({
    ok: true,
    redirect: "/cekici/panel",
    ad: cekici.ad,
  });

  response.cookies.set(CEKICI_COOKIE, cekici.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
