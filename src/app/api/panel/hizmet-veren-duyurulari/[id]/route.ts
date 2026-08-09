import { NextResponse } from "next/server";
import {
  duyuruSablonAlanDogrula,
  duyuruSablonBolumlerDogrula,
  guncelleHizmetVerenDuyuruSablon,
  MIGRATION_060_MESAJ,
  silHizmetVerenDuyuruSablon,
  hizmetVerenDuyuruSablonTablosuVar,
} from "@/lib/hizmet-veren-duyuru-db";
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

type Ctx = { params: Promise<{ id: string }> };

function dogrulaPatch(body: {
  etiket?: string;
  aciklama?: string;
  govde?: string;
  bolumler?: string[] | null;
  sira?: number | string;
  aktif?: boolean;
}):
  | {
      etiket?: string;
      aciklama?: string;
      govde?: string;
      bolumler?: string[] | null;
      sira?: number;
      aktif?: boolean;
    }
  | { error: string } {
  const patch: {
    etiket?: string;
    aciklama?: string;
    govde?: string;
    bolumler?: string[] | null;
    sira?: number;
    aktif?: boolean;
  } = {};

  if (body.etiket !== undefined) {
    const etiket = typeof body.etiket === "string" ? body.etiket.trim() : "";
    if (!etiket || etiket.length > 120) {
      return { error: "Etiket 1–120 karakter olmalı." };
    }
    patch.etiket = etiket;
  }

  if (body.aciklama !== undefined) {
    const aciklama =
      typeof body.aciklama === "string" ? body.aciklama.trim() : "";
    if (aciklama.length > 300) {
      return { error: "Açıklama en fazla 300 karakter." };
    }
    patch.aciklama = aciklama;
  }

  if (body.govde !== undefined) {
    const g = duyuruSablonAlanDogrula({
      etiket: "tmp",
      aciklama: "",
      govde: body.govde,
      sira: 0,
    });
    if ("error" in g) return { error: g.error };
    patch.govde = g.govde;
  }

  if (body.bolumler !== undefined) {
    const b = duyuruSablonBolumlerDogrula(body.bolumler);
    if ("error" in b) return b;
    patch.bolumler = b.bolumler;
  }

  if (body.sira !== undefined) {
    const sira =
      typeof body.sira === "number"
        ? Math.floor(body.sira)
        : Number.parseInt(String(body.sira), 10);
    if (!Number.isFinite(sira) || sira < 0 || sira > 9999) {
      return { error: "Geçersiz sıra." };
    }
    patch.sira = sira;
  }

  if (typeof body.aktif === "boolean") patch.aktif = body.aktif;

  if (Object.keys(patch).length === 0) {
    return { error: "Güncellenecek alan yok." };
  }
  return patch;
}

export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await panelKullanici())) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }
  if (!(await hizmetVerenDuyuruSablonTablosuVar())) {
    return NextResponse.json({ error: MIGRATION_060_MESAJ }, { status: 503 });
  }

  const { id } = await ctx.params;
  if (!id || id.startsWith("yerlesik-")) {
    return NextResponse.json(
      { error: "Bu şablon düzenlenemez." },
      { status: 400 }
    );
  }

  let body: {
    etiket?: string;
    aciklama?: string;
    govde?: string;
    bolumler?: string[] | null;
    sira?: number | string;
    aktif?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const patch = dogrulaPatch(body);
  if ("error" in patch) {
    return NextResponse.json({ error: patch.error }, { status: 400 });
  }

  try {
    const sablon = await guncelleHizmetVerenDuyuruSablon(id, patch);
    return NextResponse.json({ sablon });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Güncellenemedi.";
    return NextResponse.json({ error: mesaj }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await panelKullanici())) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!id || id.startsWith("yerlesik-")) {
    return NextResponse.json(
      { error: "Bu şablon silinemez." },
      { status: 400 }
    );
  }
  try {
    await silHizmetVerenDuyuruSablon(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Silinemedi.";
    const status = mesaj === MIGRATION_060_MESAJ ? 503 : 500;
    return NextResponse.json({ error: mesaj }, { status });
  }
}
