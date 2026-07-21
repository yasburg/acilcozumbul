import { NextResponse } from "next/server";
import { telefonGecerliMi, telefonNormalize } from "@/lib/telefon";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import { topluSmsOncekiTelefonlariBul } from "@/lib/toplu-sms-gecmis-db";
import {
  MIGRATION_027_MESAJ,
  topluSmsGecmisTablolariVar,
} from "@/lib/supabase/toplu-sms-schema";

/** Yüklenen listedeki numaralardan daha önce gönderilmiş olanları bul */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!(await topluSmsGecmisTablolariVar())) {
    return NextResponse.json({
      oncekiler: [] as string[],
      adet: 0,
      gecmisYok: true,
      uyari: MIGRATION_027_MESAJ,
    });
  }

  let body: { telefonlar?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const ham = Array.isArray(body.telefonlar) ? body.telefonlar : [];
  const gecerli = [
    ...new Set(
      ham
        .map((t) => telefonNormalize(String(t ?? "")))
        .filter((t) => telefonGecerliMi(t))
    ),
  ];

  const set = await topluSmsOncekiTelefonlariBul(gecerli);
  const oncekiler = gecerli.filter((t) => set.has(t));

  return NextResponse.json({
    oncekiler,
    adet: oncekiler.length,
    toplam: gecerli.length,
    yeniAdet: gecerli.length - oncekiler.length,
  });
}
