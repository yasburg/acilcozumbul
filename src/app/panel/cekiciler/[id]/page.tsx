"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Btn } from "@/components/ui";
import { formatKredi } from "@/lib/talep-utils";
import type { CekiciPanelOzet } from "@/lib/panel";

type CekiciDetay = CekiciPanelOzet & { token: string };

export default function PanelCekiciDetayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cekici, setCekici] = useState<CekiciDetay | null>(null);
  const [loading, setLoading] = useState(true);
  const [oturumYukleniyor, setOturumYukleniyor] = useState(false);

  useEffect(() => {
    fetch(`/api/panel/cekiciler/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setCekici(d);
      })
      .catch(() => setCekici(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function paneleGec() {
    setOturumYukleniyor(true);
    try {
      const res = await fetch(`/api/panel/cekici/${id}/oturum`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(data.redirect);
    } catch {
      alert("Oturum açılamadı.");
    } finally {
      setOturumYukleniyor(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (!cekici) {
    return (
      <Card>
        <p className="text-red-600 text-sm">Çekici bulunamadı.</p>
        <Link href="/panel/cekiciler" className="text-amber-600 text-sm mt-2 inline-block">
          ← Listeye dön
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      <Link href="/panel/cekiciler" className="text-sm text-amber-600 font-medium">
        ← Çekiciler
      </Link>

      <h2 className="text-2xl font-bold">{cekici.ad}</h2>

      <Card className="space-y-3 text-sm">
        <Row label="Telefon" value={cekici.telefon} />
        <Row label="Şehir" value={cekici.sehir} />
        <Row label="Kredi" value={formatKredi(cekici.kredi)} />
        <Row label="Durum" value={cekici.aktif ? "Aktif" : "Pasif"} />
        <Row
          label="Kayıt"
          value={new Date(cekici.kayitTarihi).toLocaleString("tr-TR")}
        />
        <Row
          label="Hizmet bölgesi"
          value={
            cekici.hizmetModu === "konum"
              ? `Konum menzili: ${cekici.menzilKm ?? 0} km`
              : cekici.hizmetBolgeleri &&
                  Object.keys(cekici.hizmetBolgeleri).length > 0
                ? Object.entries(cekici.hizmetBolgeleri)
                    .map(([il, ilceler]) => `${il}: ${ilceler.join(", ")}`)
                    .join(" · ")
                : cekici.hizmetIlceleri?.length
                  ? cekici.hizmetIlceleri.join(", ")
                  : "Seçilmemiş"
          }
        />
        <Row label="Token" value={cekici.tokenOnizleme} mono />
      </Card>

      <div className="space-y-2">
        <Btn onClick={paneleGec} disabled={oturumYukleniyor}>
          {oturumYukleniyor ? "Açılıyor…" : "Çekici paneline git"}
        </Btn>
        <p className="text-xs text-slate-500">
          Bu hesap olarak giriş yapar; /cekici/panel ekranını görürsünüz.
        </p>
        <Link
          href="/cekici/ayarlar"
          className="block text-center text-sm text-amber-600 font-medium py-2"
        >
          Ayarlar sayfası →
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={`text-slate-900 text-right ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
