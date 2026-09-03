import { NextRequest, NextResponse } from "next/server";
import {
  getTeklifCashbackAyar,
  guncelleTeklifCashbackAyar,
  teklifCashbackDurum,
  teklifCashbackMigrationMesaji,
  teklifCashbackTablosuVar,
} from "@/lib/teklif-cashback-kampanya";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";

async function panelKullanici() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) return null;
  return user;
}

export async function GET() {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!(await teklifCashbackTablosuVar())) {
    return NextResponse.json(
      {
        error: teklifCashbackMigrationMesaji(),
        ayar: { aktif: false },
        durum: "kapali",
      },
      { status: 503 }
    );
  }
  const ayar = await getTeklifCashbackAyar();
  return NextResponse.json({
    ayar,
    durum: teklifCashbackDurum(ayar),
  });
}

export async function PATCH(request: NextRequest) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!(await teklifCashbackTablosuVar())) {
    return NextResponse.json(
      { error: teklifCashbackMigrationMesaji() },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  try {
    const ayar = await guncelleTeklifCashbackAyar({
      aktif: typeof body.aktif === "boolean" ? body.aktif : undefined,
      baslangic: Object.prototype.hasOwnProperty.call(body, "baslangic")
        ? body.baslangic
        : undefined,
      bitis: Object.prototype.hasOwnProperty.call(body, "bitis")
        ? body.bitis
        : undefined,
    });
    return NextResponse.json({
      mesaj: "Teklif cashback kampanyası güncellendi.",
      ayar,
      durum: teklifCashbackDurum(ayar),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Güncellenemedi.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
