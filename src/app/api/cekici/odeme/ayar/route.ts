import { NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import {
  garantiYapilandirildi,
  garantiYapilandirmaOzeti,
} from "@/lib/garanti/config";
import { garantiSmokeKartOku } from "@/lib/garanti/smoke-kart";

/** Ödeme sayfası: Garanti aktif mi + (dev) smoke kart ön doldurma */
export async function GET() {
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const smokeKart = garantiSmokeKartOku();

  return NextResponse.json({
    garantiAktif: garantiYapilandirildi(),
    smokeKart,
    garanti: garantiYapilandirmaOzeti(),
  });
}
