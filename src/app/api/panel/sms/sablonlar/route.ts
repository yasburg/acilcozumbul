import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import {
  listeTumSmsSablonlari,
  olusturSmsSablon,
  panelSmsSablonTablosuVar,
  smsSablonAlanDogrula,
  MIGRATION_031_MESAJ,
} from "@/lib/sms-sablon-db";

async function panelKullanici() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) return null;
  return user;
}

export async function GET() {
  if (!(await panelKullanici())) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }
  if (!(await panelSmsSablonTablosuVar())) {
    return NextResponse.json({ error: MIGRATION_031_MESAJ }, { status: 503 });
  }
  try {
    const liste = await listeTumSmsSablonlari();
    return NextResponse.json({ liste });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Şablonlar yüklenemedi.";
    return NextResponse.json({ error: mesaj }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await panelKullanici())) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }
  let body: {
    etiket?: string;
    govde?: string;
    sira?: number;
    aktif?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }
  const dogrulama = smsSablonAlanDogrula(body);
  if ("error" in dogrulama) {
    return NextResponse.json({ error: dogrulama.error }, { status: 400 });
  }
  try {
    const sablon = await olusturSmsSablon({
      etiket: dogrulama.etiket,
      govde: dogrulama.govde,
      sira: dogrulama.sira,
      aktif: body.aktif !== false,
    });
    return NextResponse.json({ sablon }, { status: 201 });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Şablon oluşturulamadı.";
    const status = mesaj === MIGRATION_031_MESAJ ? 503 : 500;
    return NextResponse.json({ error: mesaj }, { status });
  }
}
