import { NextRequest, NextResponse } from "next/server";
import {
  getKrediHatirlatmaPanelVerisi,
  listeleKrediHatirlatmaManuelAdaylar,
  manuelKrediHatirlatmaGonder,
} from "@/lib/kredi-hatirlatma-db";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import { telefonMaskele } from "@/lib/telefon";

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
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const [panel, adaylar] = await Promise.all([
    getKrediHatirlatmaPanelVerisi(),
    listeleKrediHatirlatmaManuelAdaylar(),
  ]);

  return NextResponse.json({
    ozet: panel.ozet,
    satirlar: panel.satirlar.map((s) => ({
      ...s,
      telefon: telefonMaskele(s.telefon),
    })),
    adaylar: adaylar.map((a) => ({
      ...a,
      telefon: telefonMaskele(a.telefon),
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  let body: { cekiciIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const cekiciIds = Array.isArray(body.cekiciIds)
    ? body.cekiciIds.map(String).filter(Boolean)
    : [];
  if (cekiciIds.length === 0) {
    return NextResponse.json(
      { error: "En az bir çekici seçin." },
      { status: 400 }
    );
  }

  const baseUrl = smsBaseUrl(
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );

  try {
    const sonuc = await manuelKrediHatirlatmaGonder({ cekiciIds, baseUrl });
    return NextResponse.json(sonuc);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gönderim başarısız.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
