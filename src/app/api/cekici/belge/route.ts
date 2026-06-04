import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { cekiciBelgeYukle } from "@/lib/cekici-belge";
import { getCekiciById, updateCekici } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import type { BelgeDurum } from "@/lib/types";

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  return NextResponse.json({
    belgeDurum: cekici.belgeDurum ?? "yok",
    belgeRedNedeni: cekici.belgeRedNedeni ?? null,
    belgeRuhsatUrl: cekici.belgeRuhsatUrl ?? null,
    belgeCekiciUrl: cekici.belgeCekiciUrl ?? null,
    belgeGonderim: cekici.belgeGonderim ?? null,
    rozetAktif: Boolean(cekici.rozetAktif),
  });
}

export async function POST(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (cekici.belgeDurum === "beklemede") {
    return NextResponse.json(
      { error: "Belgeleriniz inceleniyor. Onay bekleyin." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const ruhsatHam = String(body.ruhsat ?? "");
  const cekiciBelgeHam = String(body.cekiciBelgesi ?? body.cekiciBelge ?? "");

  if (!ruhsatHam.trim() || !cekiciBelgeHam.trim()) {
    return NextResponse.json(
      { error: "Ruhsat ve çekici belgesi yükleyin." },
      { status: 400 }
    );
  }

  const ruhsatUrl = await cekiciBelgeYukle(cekici.id, "ruhsat", ruhsatHam);
  const cekiciUrl = await cekiciBelgeYukle(cekici.id, "cekici", cekiciBelgeHam);

  if (!ruhsatUrl || !cekiciUrl) {
    return NextResponse.json(
      { error: "Belge yüklenemedi. JPEG, PNG, WebP veya PDF (max 8 MB) kullanın." },
      { status: 400 }
    );
  }

  const guncel = await getCekiciById(cekici.id);
  if (!guncel) {
    return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
  }

  const yeni: typeof guncel = {
    ...guncel,
    belgeRuhsatUrl: ruhsatUrl,
    belgeCekiciUrl: cekiciUrl,
    belgeDurum: "beklemede" as BelgeDurum,
    belgeRedNedeni: undefined,
    belgeGonderim: new Date().toISOString(),
  };
  await updateCekici(yeni);

  return NextResponse.json({
    mesaj: "Belgeler gönderildi. Admin onayından sonra rozet satın alabilirsiniz.",
    belgeDurum: "beklemede",
  });
}
