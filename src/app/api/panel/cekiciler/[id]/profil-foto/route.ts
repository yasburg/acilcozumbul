import { NextRequest, NextResponse } from "next/server";
import { getCekiciById, updateCekiciProfilFotoDurum } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import type { ProfilFotoDurum } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeedData();
    const { id } = await params;
    const cekici = await getCekiciById(id);
    if (!cekici) {
      return NextResponse.json({ error: "Çekici bulunamadı." }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const durum = body.profilFotoDurum as ProfilFotoDurum | undefined;

    if (durum !== "onaylandi" && durum !== "reddedildi") {
      return NextResponse.json(
        { error: "profilFotoDurum: onaylandi veya reddedildi olmalı." },
        { status: 400 }
      );
    }

    if (cekici.profilFotoDurum !== "beklemede") {
      return NextResponse.json(
        {
          error: `Bu başvuru "${cekici.profilFotoDurum ?? "yok"}" durumunda; onay/red için beklemede olmalı.`,
        },
        { status: 400 }
      );
    }

    if (!cekici.profilFotoUrl?.trim()) {
      return NextResponse.json(
        { error: "Yüklü profil fotoğrafı yok." },
        { status: 400 }
      );
    }

    if (durum === "reddedildi" && !String(body.profilFotoRedNedeni ?? "").trim()) {
      return NextResponse.json({ error: "Red nedeni girin." }, { status: 400 });
    }

    const kaydedilen = await updateCekiciProfilFotoDurum(id, {
      profilFotoDurum: durum,
      profilFotoRedNedeni:
        durum === "reddedildi"
          ? String(body.profilFotoRedNedeni).trim()
          : null,
    });

    return NextResponse.json({
      mesaj:
        kaydedilen === "onaylandi"
          ? "Profil fotoğrafı onaylandı."
          : "Profil fotoğrafı reddedildi.",
      profilFotoDurum: kaydedilen,
    });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Güncellenemedi.";
    console.error("[panel/profil-foto]", mesaj);
    return NextResponse.json({ error: mesaj }, { status: 500 });
  }
}
