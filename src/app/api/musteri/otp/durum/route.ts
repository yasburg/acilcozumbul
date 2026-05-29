import { NextResponse } from "next/server";
import {
  getDogrulanmisTelefon,
  musteriTelCookieTemizle,
} from "@/lib/musteri-auth";

export async function GET() {
  const telefon = await getDogrulanmisTelefon();
  const response = NextResponse.json({
    dogrulandi: !!telefon,
    telefon: telefon ?? undefined,
  });
  if (!telefon) {
    musteriTelCookieTemizle(response);
  }
  return response;
}
