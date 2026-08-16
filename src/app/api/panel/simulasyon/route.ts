import { NextRequest, NextResponse } from "next/server";
import { getCekiciler } from "@/lib/db";
import { getAcikIller } from "@/lib/cekici-sehir-acilis-db";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { sorunTipiBul } from "@/lib/sorun-tipleri";
import {
  getSimulasyonPlanById,
  getSimulasyonFormulAyar,
  listSimulasyonPlanlar,
  panelHedefGunler,
  saveSimulasyonFormulAyar,
  simulasyonCalistir,
  simulasyonGunPlanla,
  simulasyonPlanlariTopluIptal,
  updateSimulasyonPlan,
} from "@/lib/simulasyon-ihale-db";
import {
  formulAyarEtiket,
  formulAyarNormalize,
  pgDateAnahtari,
  sehirAktifCekiciSayisi,
  SIMULASYON_SORUN_TIPLERI,
  type SimulasyonFormulAyar,
  type SimulasyonPlan,
  type SimulasyonSorunTipi,
} from "@/lib/simulasyon-ihale";
import { ilceListesi, ilGecerliMi } from "@/lib/il-ilce";

export type SimulasyonSehirOzet = {
  il: string;
  cekiciSayisi: number;
  planli: number;
  acildi: number;
  kapandi: number;
  iptal: number;
  hata: number;
  /** iptal hariç o gün planlanan / işlenen talep */
  aktifToplam: number;
  toplam: number;
};

function sehirOzetHesapla(
  acikIller: string[],
  cekiciler: Awaited<ReturnType<typeof getCekiciler>>,
  planlar: SimulasyonPlan[]
): SimulasyonSehirOzet[] {
  const map = new Map<string, SimulasyonSehirOzet>();

  for (const il of acikIller) {
    map.set(il, {
      il,
      cekiciSayisi: sehirAktifCekiciSayisi(cekiciler, il),
      planli: 0,
      acildi: 0,
      kapandi: 0,
      iptal: 0,
      hata: 0,
      aktifToplam: 0,
      toplam: 0,
    });
  }

  for (const p of planlar) {
    let row = map.get(p.il);
    if (!row) {
      row = {
        il: p.il,
        cekiciSayisi: sehirAktifCekiciSayisi(cekiciler, p.il),
        planli: 0,
        acildi: 0,
        kapandi: 0,
        iptal: 0,
        hata: 0,
        aktifToplam: 0,
        toplam: 0,
      };
      map.set(p.il, row);
    }
    row.toplam += 1;
    if (p.durum === "planli") row.planli += 1;
    else if (p.durum === "acildi") row.acildi += 1;
    else if (p.durum === "kapandi") row.kapandi += 1;
    else if (p.durum === "iptal") row.iptal += 1;
    else if (p.durum === "hata") row.hata += 1;
    if (p.durum !== "iptal") row.aktifToplam += 1;
  }

  return [...map.values()].sort((a, b) => {
    if (b.aktifToplam !== a.aktifToplam) return b.aktifToplam - a.aktifToplam;
    if (b.cekiciSayisi !== a.cekiciSayisi) return b.cekiciSayisi - a.cekiciSayisi;
    return a.il.localeCompare(b.il, "tr");
  });
}

export async function GET(request: NextRequest) {
  const gun =
    request.nextUrl.searchParams.get("gun")?.trim().slice(0, 10) || undefined;
  const { bugun, yarin } = panelHedefGunler();
  const hedef = gun || yarin;

  const [bugunPlanlar, yarinPlanlar, secili, acikIller, cekiciler, formulAyar] =
    await Promise.all([
      listSimulasyonPlanlar({ hedefGun: bugun }),
      listSimulasyonPlanlar({ hedefGun: yarin }),
      gun && gun !== bugun && gun !== yarin
        ? listSimulasyonPlanlar({ hedefGun: gun })
        : Promise.resolve(null),
      getAcikIller(),
      getCekiciler(),
      getSimulasyonFormulAyar(),
    ]);

  const planlar =
    secili ?? (hedef === bugun ? bugunPlanlar : yarinPlanlar);

  return NextResponse.json({
    bugun,
    yarin,
    seciliGun: hedef,
    formulAyar,
    formul: {
      "1-5": formulAyarEtiket(formulAyar.dusuk),
      "6-20": formulAyarEtiket(formulAyar.orta),
      "20+": formulAyarEtiket(formulAyar.yuksek),
      sure: "acil (60 dk)",
      kapanis: "açılıştan 10–45 dk",
      sorunTipleri: SIMULASYON_SORUN_TIPLERI.map((id) => ({
        id,
        label: sorunTipiBul(id)?.label ?? id,
      })),
    },
    planlar,
    bugunPlanlar,
    yarinPlanlar,
    sehirOzet: sehirOzetHesapla(acikIller, cekiciler, planlar),
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return NextResponse.json({ error: "id gerekli." }, { status: 400 });
  }

  const plan = await getSimulasyonPlanById(id);
  if (!plan) {
    return NextResponse.json({ error: "Plan bulunamadı." }, { status: 404 });
  }
  if (plan.durum !== "planli") {
    return NextResponse.json(
      { error: "Yalnızca planlı satırlar düzenlenebilir." },
      { status: 409 }
    );
  }

  if (body.iptal === true) {
    plan.durum = "iptal";
    await updateSimulasyonPlan(plan);
    return NextResponse.json({ ok: true, plan });
  }

  if (typeof body.kaynakIlce === "string" && body.kaynakIlce.trim()) {
    const ilce = body.kaynakIlce.trim();
    if (!ilceListesi(plan.il).includes(ilce)) {
      return NextResponse.json({ error: "Geçersiz ilçe." }, { status: 400 });
    }
    plan.kaynakIlce = ilce;
  }

  if (body.hedefIlce === null) {
    plan.hedefIlce = null;
  } else if (typeof body.hedefIlce === "string" && body.hedefIlce.trim()) {
    const ilce = body.hedefIlce.trim();
    if (!ilceListesi(plan.il).includes(ilce)) {
      return NextResponse.json({ error: "Geçersiz hedef ilçe." }, { status: 400 });
    }
    plan.hedefIlce = ilce;
  }

  if (typeof body.sorunTipi === "string") {
    const tip = body.sorunTipi.trim() as SimulasyonSorunTipi;
    if (!(SIMULASYON_SORUN_TIPLERI as readonly string[]).includes(tip)) {
      return NextResponse.json({ error: "Geçersiz sorun tipi." }, { status: 400 });
    }
    plan.sorunTipi = tip;
    if (tip !== "cekici") plan.hedefIlce = null;
  }

  if (typeof body.planlananAcilisAt === "string" && body.planlananAcilisAt.trim()) {
    const acilis = new Date(body.planlananAcilisAt);
    if (Number.isNaN(acilis.getTime())) {
      return NextResponse.json({ error: "Geçersiz açılış." }, { status: 400 });
    }
    plan.planlananAcilisAt = acilis.toISOString();
    plan.ihaleBitisAt = new Date(
      acilis.getTime() + 60 * 60 * 1000
    ).toISOString();
  }

  await updateSimulasyonPlan(plan);
  return NextResponse.json({ ok: true, plan });
}

export async function POST(request: NextRequest) {
  try {
    return await postSimulasyon(request);
  } catch (e) {
    console.error("[panel/simulasyon] POST", e);
    const msg =
      e instanceof Error
        ? e.message
        : e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : String(e);
    return NextResponse.json(
      { error: msg.slice(0, 500) || "İşlem başarısız." },
      { status: 500 }
    );
  }
}

async function postSimulasyon(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const eylem = typeof body.eylem === "string" ? body.eylem.trim() : "";

  if (eylem === "planla") {
    const hedefGun =
      typeof body.hedefGun === "string" && body.hedefGun.trim()
        ? body.hedefGun.trim().slice(0, 10)
        : undefined;
    const forceIl =
      typeof body.il === "string" && body.il.trim() && ilGecerliMi(body.il.trim())
        ? body.il.trim()
        : undefined;
    const iller = Array.isArray(body.iller)
      ? [
          ...new Set(
            (body.iller as unknown[])
              .filter((il): il is string => typeof il === "string")
              .map((il) => il.trim())
              .filter((il) => il.length > 0 && ilGecerliMi(il))
          ),
        ]
      : [];

    if (forceIl) {
      const sonuc = await simulasyonGunPlanla({
        hedefGun,
        kaynagi: "manuel",
        forceIl,
      });
      return NextResponse.json({ ok: true, ...sonuc });
    }

    if (iller.length > 0) {
      const sonuc = await simulasyonGunPlanla({
        hedefGun,
        kaynagi: "manuel",
        iller,
      });
      return NextResponse.json({ ok: true, ...sonuc });
    }

    // Tüm gün: mevcut planlı yoksa üret; force=true ise tüm planlıları silip yeniden
    if (body.force === true && hedefGun) {
      await simulasyonPlanlariTopluIptal(hedefGun);
      const sonuc = await simulasyonGunPlanla({
        hedefGun,
        kaynagi: "manuel",
        force: true,
      });
      return NextResponse.json({ ok: true, ...sonuc });
    }

    const sonuc = await simulasyonGunPlanla({
      hedefGun,
      kaynagi: "manuel",
    });
    return NextResponse.json({ ok: true, ...sonuc });
  }

  if (eylem === "calistir") {
    const baseUrl = smsBaseUrl(
      `${request.nextUrl.protocol}//${request.nextUrl.host}`
    );
    const sonuc = await simulasyonCalistir({ baseUrl });
    return NextResponse.json({ ok: true, ...sonuc });
  }

  if (eylem === "toplu_iptal") {
    const ham =
      typeof body.hedefGun === "string" ? body.hedefGun.trim() : "";
    if (!ham) {
      return NextResponse.json(
        { error: "hedefGun gerekli." },
        { status: 400 }
      );
    }
    const hedefGun = pgDateAnahtari(ham);
    const iptal = await simulasyonPlanlariTopluIptal(hedefGun);
    return NextResponse.json({ ok: true, iptal, hedefGun });
  }

  if (eylem === "ayar_kaydet") {
    const ayar = formulAyarNormalize(
      (body.formulAyar ?? body.ayar) as Partial<SimulasyonFormulAyar>
    );
    const kaydedilen = await saveSimulasyonFormulAyar(ayar);
    return NextResponse.json({ ok: true, formulAyar: kaydedilen });
  }

  return NextResponse.json({ error: "Geçersiz eylem." }, { status: 400 });
}
