import { NextRequest, NextResponse } from "next/server";
import {
  getKayitUcretsizKrediAyar,
  guncelleKayitUcretsizKrediAyar,
  kayitUcretsizKrediMigrationMesaji,
  kayitUcretsizKrediTablosuVar,
} from "@/lib/kayit-ucretsiz-kredi";
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
  if (!(await kayitUcretsizKrediTablosuVar())) {
    return NextResponse.json(
      {
        error: kayitUcretsizKrediMigrationMesaji(),
        ayar: { aktif: true, krediMiktar: 9 },
      },
      { status: 503 }
    );
  }
  const ayar = await getKayitUcretsizKrediAyar();
  return NextResponse.json({ ayar });
}

export async function PATCH(request: NextRequest) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!(await kayitUcretsizKrediTablosuVar())) {
    return NextResponse.json(
      { error: kayitUcretsizKrediMigrationMesaji() },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  try {
    const ayar = await guncelleKayitUcretsizKrediAyar({
      aktif: typeof body.aktif === "boolean" ? body.aktif : undefined,
      krediMiktar:
        body.krediMiktar != null && body.krediMiktar !== ""
          ? Number(body.krediMiktar)
          : undefined,
    });
    return NextResponse.json({
      mesaj: "Ücretsiz kayıt kredisi güncellendi.",
      ayar,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Güncellenemedi.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
