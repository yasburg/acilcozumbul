import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import {
  guncelleSmsSablon,
  silSmsSablon,
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

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await panelKullanici())) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Kimlik gerekli." }, { status: 400 });
  }

  let body: {
    etiket?: string;
    govde?: string;
    sira?: number | string;
    aktif?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const patch: {
    etiket?: string;
    govde?: string;
    sira?: number;
    aktif?: boolean;
  } = {};

  if (body.etiket !== undefined) {
    const etiket = typeof body.etiket === "string" ? body.etiket.trim() : "";
    if (!etiket || etiket.length > 120) {
      return NextResponse.json({ error: "Geçersiz etiket." }, { status: 400 });
    }
    patch.etiket = etiket;
  }
  if (body.govde !== undefined) {
    const govde = typeof body.govde === "string" ? body.govde.trim() : "";
    if (!govde || govde.length > 2000) {
      return NextResponse.json({ error: "Geçersiz gövde." }, { status: 400 });
    }
    patch.govde = govde;
  }
  if (body.sira !== undefined) {
    const sira =
      typeof body.sira === "number"
        ? Math.floor(body.sira)
        : Number.parseInt(String(body.sira), 10);
    if (!Number.isFinite(sira) || sira < 0 || sira > 9999) {
      return NextResponse.json({ error: "Geçersiz sıra." }, { status: 400 });
    }
    patch.sira = sira;
  }
  if (typeof body.aktif === "boolean") patch.aktif = body.aktif;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { error: "Güncellenecek alan yok." },
      { status: 400 }
    );
  }

  try {
    const sablon = await guncelleSmsSablon(id, patch);
    return NextResponse.json({ sablon });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Güncellenemedi.";
    const status = mesaj === MIGRATION_031_MESAJ ? 503 : 500;
    return NextResponse.json({ error: mesaj }, { status });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await panelKullanici())) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: "Kimlik gerekli." }, { status: 400 });
  }
  try {
    await silSmsSablon(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Silinemedi.";
    const status = mesaj === MIGRATION_031_MESAJ ? 503 : 500;
    return NextResponse.json({ error: mesaj }, { status });
  }
}
