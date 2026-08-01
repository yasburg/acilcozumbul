import { NextRequest, NextResponse } from "next/server";
import {
  listeleSehirAcilis,
  sehirAcilisAyarla,
  sehirAcilisTopluAyarla,
} from "@/lib/cekici-sehir-acilis-db";
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
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const iller = await listeleSehirAcilis();
  return NextResponse.json({
    iller,
    acikSayisi: iller.filter((i) => i.acik).length,
    toplam: iller.length,
  });
}

export async function PATCH(request: NextRequest) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  let body: { il?: string; acik?: boolean; tumu?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  if (typeof body.acik !== "boolean") {
    return NextResponse.json(
      { error: "acik (boolean) gerekli." },
      { status: 400 }
    );
  }

  if (body.tumu === true) {
    try {
      const sonuc = await sehirAcilisTopluAyarla(body.acik);
      return NextResponse.json({ ok: true, tumu: true, ...sonuc });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Güncellenemedi.";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  const il = typeof body.il === "string" ? body.il.trim() : "";
  if (!il) {
    return NextResponse.json(
      { error: "il (string) veya tumu: true gerekli." },
      { status: 400 }
    );
  }

  try {
    const satir = await sehirAcilisAyarla(il, body.acik);
    return NextResponse.json({ ok: true, ...satir });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Güncellenemedi.";
    const status = msg.includes("Geçersiz") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
