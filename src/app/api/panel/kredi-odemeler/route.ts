import { NextResponse } from "next/server";
import { listeleKrediOdemeler } from "@/lib/kredi-odeme";

export async function GET() {
  const liste = await listeleKrediOdemeler();
  return NextResponse.json(
    liste.map((k) => ({
      id: k.id,
      cekiciAd: k.cekiciAd,
      cekiciTelefon: k.cekiciTelefon,
      miktar: k.miktar,
      tutar: k.tutar,
      listeFiyati: k.listeFiyati,
      paketTl: k.paketTl,
      faturaEposta: k.faturaEposta,
      kurumsal: k.kurumsal,
      sirketUnvan: k.sirketUnvan,
      odemeReferans: k.odemeReferans,
      demoOdeme: k.demoOdeme,
      olusturulma: k.olusturulma,
    }))
  );
}
