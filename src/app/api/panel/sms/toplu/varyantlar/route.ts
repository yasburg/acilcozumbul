import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import { SMS50_KAMPANYA_KODU } from "@/lib/sms50-kampanya";
import {
  getSms50VaryantOzetleri,
  smsKampanyaTiklamaTablosuVar,
} from "@/lib/sms50-tiklama-db";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!(await smsKampanyaTiklamaTablosuVar())) {
    return NextResponse.json(
      {
        error:
          "SMS50 tıklama tablosu yok. supabase/migrations/029_sms50_kampanya_tiklama.sql çalıştırın.",
      },
      { status: 503 }
    );
  }

  const kampanya =
    request.nextUrl.searchParams.get("kampanya")?.trim() ||
    SMS50_KAMPANYA_KODU;

  try {
    const liste = await getSms50VaryantOzetleri(kampanya);
    return NextResponse.json({ kampanya, liste });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Özet yüklenemedi.";
    return NextResponse.json({ error: mesaj }, { status: 500 });
  }
}
