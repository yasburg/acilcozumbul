import { after, NextRequest, NextResponse } from "next/server";
import {
  ensureKrediTanimSmsSablon,
  KREDI_TANIM_SABLON_GOVDE,
  krediTanimSmsMesaji,
  listeleKrediDagitimAdaylari,
  topluKrediDagit,
  type KrediDagitimFiltre,
  type KrediDagitimUcDurum,
} from "@/lib/panel-kredi-dagitim";
import { netgsmSmsMesajGecerliMi } from "@/lib/sms-karakter";
import { sendSms, smsDurumu } from "@/lib/sms-provider";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import {
  MIGRATION_033_MESAJ,
  topluSmsIsTablolariVar,
} from "@/lib/supabase/toplu-sms-schema";
import {
  olusturTopluSmsIsi,
  tetikleTopluSmsKuyruk,
} from "@/lib/toplu-sms-is-db";
import { TOPLU_SMS_TEMPO_VARSAYILAN } from "@/lib/toplu-sms-tempo";

async function panelKullanici() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) return null;
  return user;
}

function ucDurumParse(raw: string | null): KrediDagitimUcDurum {
  if (raw === "evet" || raw === "hayir") return raw;
  return "hepsi";
}

function sayiParse(raw: string | null): number | null {
  if (raw == null || raw.trim() === "") return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function filtreFromSearch(url: URL): KrediDagitimFiltre {
  const sehirler = url.searchParams.getAll("sehir").filter(Boolean);
  const sehirCsv = url.searchParams.get("sehirler");
  if (sehirCsv) {
    sehirler.push(
      ...sehirCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }
  return {
    sehirler: [...new Set(sehirler)],
    abone: ucDurumParse(url.searchParams.get("abone")),
    rozet: ucDurumParse(url.searchParams.get("rozet")),
    profilFoto: ucDurumParse(url.searchParams.get("profilFoto")),
    teklifMin: sayiParse(url.searchParams.get("teklifMin")),
    teklifMax: sayiParse(url.searchParams.get("teklifMax")),
    harcananMin: sayiParse(url.searchParams.get("harcananMin")),
    harcananMax: sayiParse(url.searchParams.get("harcananMax")),
  };
}

export async function GET(request: NextRequest) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  try {
    const filtre = filtreFromSearch(request.nextUrl);
    const { satirlar, sehirler, sablon } =
      await listeleKrediDagitimAdaylari(filtre);
    return NextResponse.json({
      satirlar,
      sehirler,
      sablon: sablon
        ? { id: sablon.id, etiket: sablon.etiket, govde: sablon.govde }
        : null,
      adet: satirlar.length,
    });
  } catch (e) {
    const mesaj = e instanceof Error ? e.message : "Liste yüklenemedi.";
    console.error("[panel/kredi-dagitim] GET", e);
    return NextResponse.json({ error: mesaj }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  let body: {
    cekiciIds?: string[];
    miktar?: number;
    smsGonder?: boolean;
    sablonGovde?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const cekiciIds = Array.isArray(body.cekiciIds)
    ? body.cekiciIds.map(String).filter(Boolean)
    : [];
  const miktar = Math.floor(Number(body.miktar));
  const smsGonder = body.smsGonder !== false;

  let sablonGovde =
    typeof body.sablonGovde === "string" ? body.sablonGovde.trim() : "";
  const sablon = await ensureKrediTanimSmsSablon(
    sablonGovde || undefined
  );
  if (!sablonGovde) {
    sablonGovde = sablon?.govde ?? KREDI_TANIM_SABLON_GOVDE;
  }
  const mesaj = krediTanimSmsMesaji(miktar, sablonGovde || undefined);
  const mesajKontrol = netgsmSmsMesajGecerliMi(mesaj);
  if (smsGonder && !mesajKontrol.gecerli) {
    return NextResponse.json(
      { error: mesajKontrol.hata ?? "SMS metni geçersiz." },
      { status: 400 }
    );
  }

  try {
    const { dagitilan, alicilar } = await topluKrediDagit({
      cekiciIds,
      miktar,
    });

    let sms: {
      kuyrukId?: string;
      gonderilen?: number;
      basarisiz?: number;
      atlandi?: boolean;
      hata?: string;
    } = { atlandi: !smsGonder };

    if (smsGonder) {
      const durum = smsDurumu();
      if (!durum.gercekGonderim) {
        sms = {
          atlandi: true,
          hata: "Netgsm yapılandırılmadığı için SMS kuyruğa alınmadı; krediler dağıtıldı.",
        };
      } else if (await topluSmsIsTablolariVar()) {
        const is = await olusturTopluSmsIsi({
          gonderenEposta: user.email,
          mesaj,
          mesajParca: mesajKontrol.parca,
          mesajBirim: mesajKontrol.birim,
          tempo: TOPLU_SMS_TEMPO_VARSAYILAN,
          alicilar: alicilar.map((a) => ({
            telefon: a.telefon,
            ad: a.ad,
          })),
        });
        after(() => {
          void tetikleTopluSmsKuyruk();
        });
        sms = { kuyrukId: is.id, gonderilen: alicilar.length };
      } else {
        let gonderilen = 0;
        let basarisiz = 0;
        for (const a of alicilar) {
          const r = await sendSms(a.telefon, mesaj, {
            aliciTipi: "cekici",
            cekiciId: a.id,
            krediDus: false,
          });
          if (r.basarili) gonderilen += 1;
          else basarisiz += 1;
        }
        sms = {
          gonderilen,
          basarisiz,
          hata: MIGRATION_033_MESAJ,
        };
      }
    }

    return NextResponse.json({
      success: true,
      dagitilan,
      miktar,
      mesaj,
      sms,
    });
  } catch (e) {
    const mesajHata = e instanceof Error ? e.message : "Dağıtım başarısız.";
    console.error("[panel/kredi-dagitim] POST", e);
    return NextResponse.json({ error: mesajHata }, { status: 400 });
  }
}
