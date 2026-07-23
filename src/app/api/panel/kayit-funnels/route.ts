import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import { getSupabaseAdmin, supabaseDbAktif } from "@/lib/supabase/admin";
import {
  kayitFunnelAktifListe,
  kayitFunnelYolu,
} from "@/lib/kayit-funnel";
import { kayitFunnelOzetHesapla } from "@/lib/kayit-funnel-olay";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!supabaseDbAktif()) {
    return NextResponse.json({ error: "Veritabanı yok." }, { status: 503 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("kayit_funnel_olay")
    .select("funnel, olay");
  if (error) {
    return NextResponse.json(
      {
        error:
          error.message.includes("kayit_funnel_olay")
            ? "kayit_funnel_olay tablosu yok. 036_kayit_funnel.sql çalıştırın."
            : error.message,
      },
      { status: 503 }
    );
  }

  const tanimlar = kayitFunnelAktifListe().map((f) => ({
    id: f.id,
    etiket: f.etiket,
    yol: kayitFunnelYolu(f.id),
  }));
  const liste = kayitFunnelOzetHesapla(data ?? [], tanimlar);
  return NextResponse.json({ liste });
}
