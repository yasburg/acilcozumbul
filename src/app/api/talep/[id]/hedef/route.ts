import { NextRequest, NextResponse } from "next/server";
import { getTalepById } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ensureSeedData } from "@/lib/seed";
import { getDogrulanmisTelefon } from "@/lib/musteri-auth";
import { telefonNormalize } from "@/lib/telefon";
import { koordinatGecerli } from "@/lib/koordinat";
import { ihaleAcikMi } from "@/lib/ihale";
import { sorunHedefKonumGerekliMi } from "@/lib/sorun-tipleri";
import { isDemoTalepId } from "@/lib/demo-oturum";
import { demoHedefKonumGuncelle } from "@/lib/demo-hedef-guncelle";
import type { Konum } from "@/lib/types";

function konumOku(raw: unknown): Konum | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const lat = Number(o.lat);
  const lng = Number(o.lng);
  const adres = typeof o.adres === "string" ? o.adres.trim() : "";
  if (!adres || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const konum: Konum = { lat, lng, adres };
  if (!koordinatGecerli(konum)) return null;
  return konum;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureSeedData();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const hedef = konumOku((body as { hedefKonum?: unknown }).hedefKonum);
  if (!hedef) {
    return NextResponse.json(
      { error: "Geçerli hedef konum gerekli." },
      { status: 400 }
    );
  }

  if (isDemoTalepId(id)) {
    try {
      const sonuc = await demoHedefKonumGuncelle(id, hedef, request);
      return NextResponse.json(sonuc);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Güncellenemedi.";
      const status = msg.includes("bir kez") ? 409 : 400;
      return NextResponse.json({ error: msg }, { status });
    }
  }

  const talep = await getTalepById(id);
  if (!talep) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }

  const dogrulanmis = await getDogrulanmisTelefon();
  if (!dogrulanmis || dogrulanmis !== telefonNormalize(talep.telefon)) {
    return NextResponse.json(
      { error: "Bu talebi güncellemek için telefon doğrulaması gerekli." },
      { status: 403 }
    );
  }

  if (!sorunHedefKonumGerekliMi(talep.sorunTipi) && !talep.hedefKonum) {
    return NextResponse.json(
      { error: "Bu talepte hedef konum değiştirilemez." },
      { status: 400 }
    );
  }

  if (talep.hedefKonumDegistirildi) {
    return NextResponse.json(
      {
        error:
          "Hedef adres yalnızca bir kez değiştirilebilir. Daha önce değiştirilmiş.",
      },
      { status: 409 }
    );
  }

  if (talep.kazananCekiciId || !ihaleAcikMi(talep)) {
    return NextResponse.json(
      { error: "İhale kapandıktan sonra hedef değiştirilemez." },
      { status: 400 }
    );
  }

  const { error } = await getSupabaseAdmin()
    .from("talepler")
    .update({
      hedef_konum: hedef,
      hedef_konum_degistirildi: true,
      hedef_bilinmiyor: false,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      {
        error: error.message.includes("hedef_konum_degistirildi")
          ? "Veritabanı güncellemesi gerekli (hedef_konum_degistirildi)."
          : error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    hedefKonum: hedef,
    hedefKonumDegistirildi: true,
  });
}
