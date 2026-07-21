import { NextResponse } from "next/server";
import { telefonGecerliMi, telefonNormalize } from "@/lib/telefon";
import { netgsmSmsMesajGecerliMi } from "@/lib/sms-karakter";
import { sendPanelTopluSms, smsDurumu } from "@/lib/sms-provider";

const MAX_ALICI = 500;

export async function POST(request: Request) {
  let body: { mesaj?: string; telefonlar?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const mesaj = typeof body.mesaj === "string" ? body.mesaj.trim() : "";
  const mesajKontrol = netgsmSmsMesajGecerliMi(mesaj);
  if (!mesajKontrol.gecerli) {
    return NextResponse.json(
      { error: mesajKontrol.hata ?? "Mesaj geçersiz." },
      { status: 400 }
    );
  }

  const hamListe = Array.isArray(body.telefonlar) ? body.telefonlar : [];
  const gecerli: string[] = [];
  const gecersiz: string[] = [];
  for (const ham of hamListe) {
    const t = telefonNormalize(String(ham ?? ""));
    if (telefonGecerliMi(t)) gecerli.push(t);
    else if (String(ham ?? "").trim()) gecersiz.push(String(ham));
  }
  const benzersiz = [...new Set(gecerli)];

  if (benzersiz.length === 0) {
    return NextResponse.json(
      { error: "Gönderilecek geçerli telefon yok." },
      { status: 400 }
    );
  }
  if (benzersiz.length > MAX_ALICI) {
    return NextResponse.json(
      { error: `En fazla ${MAX_ALICI} alıcı gönderilebilir.` },
      { status: 400 }
    );
  }

  const durum = smsDurumu();
  if (!durum.gercekGonderim) {
    return NextResponse.json(
      {
        error:
          "Netgsm yapılandırılmamış. NETGSM_USERCODE / PASSWORD / MSGHEADER gerekli.",
      },
      { status: 503 }
    );
  }

  const sonuc = await sendPanelTopluSms(benzersiz, mesaj);

  return NextResponse.json({
    ...sonuc,
    mesajBirim: mesajKontrol.birim,
    mesajParca: mesajKontrol.parca,
    gecersizAtlandi: gecersiz.length,
  });
}
