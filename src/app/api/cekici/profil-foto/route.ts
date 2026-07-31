import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { cekiciProfilFotoYukle } from "@/lib/cekici-profil-foto";
import { getCekiciById, updateCekici } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import type { ProfilFotoDurum } from "@/lib/types";

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  return NextResponse.json({
    profilFotoUrl: cekici.profilFotoUrl ?? null,
    profilFotoDurum: cekici.profilFotoDurum ?? "yok",
    profilFotoRedNedeni: cekici.profilFotoRedNedeni ?? null,
    profilFotoGonderim: cekici.profilFotoGonderim ?? null,
  });
}

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const fotoHam = String(body.fotograf ?? body.foto ?? "");
  const riza = body.riza === true || body.riza === "true" || body.riza === 1;

  if (!riza) {
    return NextResponse.json(
      {
        error:
          "Profil fotoğrafının işlenmesi için gizlilik politikası onayını işaretleyin.",
      },
      { status: 400 }
    );
  }

  if (!fotoHam.trim()) {
    return NextResponse.json(
      { error: "Profil fotoğrafı yükleyin." },
      { status: 400 }
    );
  }

  const url = await cekiciProfilFotoYukle(cekici.id, fotoHam);
  if (!url) {
    return NextResponse.json(
      {
        error:
          "Fotoğraf yüklenemedi. JPEG, PNG veya WebP (max 5 MB) kullanın.",
      },
      { status: 400 }
    );
  }

  const guncel = await getCekiciById(cekici.id);
  if (!guncel) {
    return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
  }

  const yeni: typeof guncel = {
    ...guncel,
    profilFotoUrl: url,
    profilFotoDurum: "beklemede" as ProfilFotoDurum,
    profilFotoRedNedeni: undefined,
    profilFotoGonderim: new Date().toISOString(),
  };
  await updateCekici(yeni);

  return NextResponse.json({
    mesaj: "Fotoğraf gönderildi. İnceleme sonrası hesabınızda görünecek.",
    profilFotoUrl: url,
    profilFotoDurum: "beklemede",
  });
}
