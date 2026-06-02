import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { updateCekici } from "@/lib/db";
import { ilceListesi, DESTEKLENEN_ILLER } from "@/lib/il-ilce";
import {
  ISTANBUL_AVRUPA_ILCELER,
  ISTANBUL_ASYA_ILCELER,
  ISTANBUL_IL,
} from "@/lib/istanbul-ilceler";
import {
  cekiciHizmetBolgeleri,
  cekiciHizmetModu,
  cekiciKonumGuncelMi,
  hizmetBolgeleriIlceSayisi,
  menzilKmSinirla,
  normalizeHizmetBolgeleri,
} from "@/lib/cekici-hizmet-bolge";
import type { HizmetBolgeModu, HizmetBolgeleri } from "@/lib/types";
import { ensureSeedData } from "@/lib/seed";
import {
  hizmetBolgeSutunlariVar,
  MIGRATION_007_MESAJ,
} from "@/lib/supabase/bolge-schema";

function bolgeOzet(bolgeler: HizmetBolgeleri): string {
  const parcalar = Object.entries(bolgeler).map(
    ([il, ilceler]) => `${il} (${ilceler.length})`
  );
  return parcalar.join(", ");
}

export async function GET() {
  try {
    await ensureSeedData();
    const cekici = await getCurrentCekici();
    if (!cekici) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }

    const bolgeler = cekiciHizmetBolgeleri(cekici);
    const mod = cekiciHizmetModu(cekici);
    const schemaHazir = await hizmetBolgeSutunlariVar();

    return NextResponse.json({
      mod,
      bolgeler,
      menzilKm: cekici.menzilKm ?? 30,
      konumLat: cekici.konumLat ?? null,
      konumLng: cekici.konumLng ?? null,
      konumGuncelleme: cekici.konumGuncelleme ?? null,
      konumGuncel: cekiciKonumGuncelMi(cekici, 10),
      tumIller: DESTEKLENEN_ILLER,
      istanbul: {
        il: ISTANBUL_IL,
        avrupa: [...ISTANBUL_AVRUPA_ILCELER],
        asya: [...ISTANBUL_ASYA_ILCELER],
      },
      ilceSayisi: hizmetBolgeleriIlceSayisi(bolgeler),
      schemaHazir,
      schemaUyari: schemaHazir ? undefined : MIGRATION_007_MESAJ,
    });
  } catch (e) {
    console.error("[bolgeler GET]", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Bölge ayarları yüklenemedi.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureSeedData();
    const cekici = await getCurrentCekici();
    if (!cekici) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }

    if (!(await hizmetBolgeSutunlariVar())) {
      return NextResponse.json({ error: MIGRATION_007_MESAJ }, { status: 503 });
    }

    const body = await request.json();
    const mod: HizmetBolgeModu =
      body.mod === "konum" ? "konum" : "il_ilce";

    cekici.hizmetModu = mod;

    if (mod === "konum") {
      cekici.menzilKm = menzilKmSinirla(body.menzilKm);
    } else {
      const bolgeler = normalizeHizmetBolgeleri(body.bolgeler as HizmetBolgeleri);
      cekici.hizmetBolgeleri = bolgeler;
      cekici.hizmetIlceleri = Object.values(bolgeler).flat();
      cekici.menzilKm = menzilKmSinirla(body.menzilKm ?? cekici.menzilKm);
    }

    await updateCekici(cekici);

    const kayitli = cekiciHizmetBolgeleri(cekici);
    let mesaj: string;
    if (mod === "konum") {
      mesaj =
        cekici.menzilKm && cekici.menzilKm > 0
          ? `Konum modu: ${cekici.menzilKm} km menzil. Panelde konumunuz dakikada bir güncellenir.`
          : "Konum modu kaydedildi. Menzil 0 km — bildirim almak için menzili artırın ve panele girin.";
    } else {
      const n = hizmetBolgeleriIlceSayisi(kayitli);
      mesaj =
        n > 0
          ? `${n} ilçe kaydedildi (${bolgeOzet(kayitli)}).`
          : "İl/ilçe seçilmedi — bu modda talep bildirimi almayacaksınız.";
    }

    return NextResponse.json({
      mesaj,
      mod: cekiciHizmetModu(cekici),
      bolgeler: kayitli,
      menzilKm: cekici.menzilKm ?? 30,
      ilceSayisi: hizmetBolgeleriIlceSayisi(kayitli),
    });
  } catch (e) {
    console.error("[bolgeler PUT]", e);
    const msg = e instanceof Error ? e.message : "Kayıt başarısız.";
    return NextResponse.json(
      {
        error: msg.includes("hizmet_")
          ? `${MIGRATION_007_MESAJ} (${msg})`
          : msg,
      },
      { status: 500 }
    );
  }
}

/** İl için tüm ilçe listesi (ayarlar UI) */
export async function POST(request: NextRequest) {
  try {
    await ensureSeedData();
    const cekici = await getCurrentCekici();
    if (!cekici) {
      return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
    }

    const { il } = await request.json();
    if (typeof il !== "string" || !il.trim()) {
      return NextResponse.json({ error: "il gerekli." }, { status: 400 });
    }

    return NextResponse.json({
      il: il.trim(),
      tumIlceler: ilceListesi(il.trim()),
    });
  } catch (e) {
    console.error("[bolgeler POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "İlçe listesi alınamadı." },
      { status: 500 }
    );
  }
}
