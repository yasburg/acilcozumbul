"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui";
import type { KrediOdeme } from "@/lib/types";

function Satir({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-slate-100 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-900 text-right font-medium break-all">{value}</span>
    </div>
  );
}

export default function PanelKrediOdemeDetayPage() {
  const params = useParams();
  const id = params.id as string;
  const [kayit, setKayit] = useState<KrediOdeme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/panel/kredi-odemeler/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setKayit)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (!kayit) {
    return (
      <Card>
        <p className="text-slate-600">Kayıt bulunamadı.</p>
        <Link href="/panel/kredi-odemeler" className="text-amber-600 text-sm mt-2 inline-block">
          ← Listeye dön
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/panel/kredi-odemeler"
        className="text-sm text-amber-600 font-medium"
      >
        ← Kredi satın alımları
      </Link>

      <div>
        <h2 className="text-2xl font-bold">Ödeme detayı</h2>
        <p className="text-sm text-slate-500">
          {new Date(kayit.olusturulma).toLocaleString("tr-TR")}
        </p>
      </div>

      <Card>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
          Çekici
        </h3>
        <Satir label="Ad" value={kayit.cekiciAd} />
        <Satir label="Telefon" value={kayit.cekiciTelefon} />
        <Satir label="Çekici ID" value={kayit.cekiciId} />
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
          Ödeme
        </h3>
        <Satir label="Kredi" value={`${kayit.miktar}`} />
        <Satir label="Paket (liste)" value={`${kayit.paketTl} ₺`} />
        <Satir label="Ödenen tutar" value={`${kayit.tutar} ₺`} />
        <Satir label="Banka referansı" value={kayit.odemeReferans} />
        <Satir label="Garanti kod" value={kayit.garantiRespCode} />
        <Satir label="Ortam" value={kayit.demoOdeme ? "Demo" : "Canlı"} />
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
          Fatura bilgileri
        </h3>
        <Satir label="E-posta" value={kayit.faturaEposta} />
        <Satir label="Adres" value={kayit.faturaAdres} />
        <Satir label="TC kimlik" value={kayit.faturaTcKimlik} />
        <Satir label="Kurumsal" value={kayit.kurumsal ? "Evet" : "Hayır"} />
        {kayit.kurumsal && (
          <>
            <Satir label="Şirket ünvanı" value={kayit.sirketUnvan} />
            <Satir label="Vergi no" value={kayit.vergiNo} />
          </>
        )}
      </Card>
    </div>
  );
}
