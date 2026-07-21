import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import {
  getTopluSmsGenelTelefonlar,
  getTopluSmsListeAlicilar,
  getTopluSmsListeler,
} from "@/lib/toplu-sms-gecmis-db";
import {
  MIGRATION_027_MESAJ,
  topluSmsGecmisTablolariVar,
} from "@/lib/supabase/toplu-sms-schema";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!(await topluSmsGecmisTablolariVar())) {
    return NextResponse.json(
      { error: MIGRATION_027_MESAJ },
      { status: 503 }
    );
  }

  const tip = request.nextUrl.searchParams.get("tip") ?? "listeler";
  const listeId = request.nextUrl.searchParams.get("listeId");

  if (tip === "liste-alicilar" && listeId) {
    const alicilar = await getTopluSmsListeAlicilar(listeId);
    return NextResponse.json({ alicilar });
  }

  if (tip === "genel") {
    const telefonlar = await getTopluSmsGenelTelefonlar(500);
    return NextResponse.json({ telefonlar, adet: telefonlar.length });
  }

  const listeler = await getTopluSmsListeler(50);
  return NextResponse.json({ listeler, adet: listeler.length });
}
