"use client";

import { useState } from "react";
import { Btn, Card, Field } from "@/components/ui";
import { YildizPuani } from "@/components/YildizPuani";
import { posthogOlayYakala } from "@/lib/posthog-client";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";

interface MemnuniyetFormuProps {
  talepId: string;
  cekiciAd?: string;
  sorunTipi?: string | null;
  onTamamlandi?: () => void;
}

export function MemnuniyetFormu({
  talepId,
  cekiciAd,
  sorunTipi,
  onTamamlandi,
}: MemnuniyetFormuProps) {
  const [puanGenel, setPuanGenel] = useState(0);
  const [puanFiyat, setPuanFiyat] = useState(0);
  const [puanSure, setPuanSure] = useState(0);
  const [yorum, setYorum] = useState("");
  const [loading, setLoading] = useState(false);
  const [hata, setHata] = useState("");
  const [tesekkur, setTesekkur] = useState(false);

  async function gonder() {
    if (puanGenel < 1 || puanFiyat < 1 || puanSure < 1) {
      setHata("Lütfen her soru için 1–5 yıldız seçin.");
      return;
    }
    setLoading(true);
    setHata("");
    try {
      const res = await fetch(`/api/talep/${talepId}/memnuniyet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          puanGenel,
          puanFiyat,
          puanSure,
          yorum,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTesekkur(true);
      posthogOlayYakala("memnuniyet_gonderildi", {
        talep_id: talepId,
        ...(sorunTipi ? { sorun_tipi: sorunTipi } : {}),
        puan_genel: puanGenel,
        puan_fiyat: puanFiyat,
        puan_sure: puanSure,
      });
      onTamamlandi?.();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Gönderilemedi.");
    } finally {
      setLoading(false);
    }
  }

  if (tesekkur) {
    return (
      <Card className="!bg-[var(--acb-soft)] !border-[color-mix(in_srgb,var(--acb-green)_35%,white)] text-center py-8">
        <AcbIcons.check
          className="mx-auto mb-2 size-10 text-[var(--acb-green)]"
          strokeWidth={ACB_ICON_STROKE}
          aria-hidden
        />
        <p className="font-semibold text-[var(--acb-dark)]">Teşekkürler!</p>
        <p className="text-sm text-[var(--acb-muted)] mt-1">
          Geri bildiriminiz kaydedildi.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900">Hizmet Değerlendirmesi</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          {cekiciAd
            ? `${cekiciAd} ile yaşadığınız deneyimi birkaç soruyla değerlendirin.`
            : "Çekici hizmetini değerlendirin."}
        </p>
      </div>

      {hata && (
        <Card className="bg-red-50 border-red-200">
          <p className="text-sm text-red-700">{hata}</p>
        </Card>
      )}

      <YildizPuani
        label="Genel memnuniyet"
        aciklama="Hizmetten genel olarak ne kadar memnunsunuz?"
        value={puanGenel}
        onChange={setPuanGenel}
      />
      <YildizPuani
        label="Fiyat doğruluğu"
        aciklama="Çekicinin aldığı ücret, verdiği teklifle uyumlu muydu?"
        value={puanFiyat}
        onChange={setPuanFiyat}
      />
      <YildizPuani
        label="Varış süresi doğruluğu"
        aciklama="Çekici, söylediği sürede veya makul bir sürede geldi mi?"
        value={puanSure}
        onChange={setPuanSure}
      />

      <Field
        label="Ek yorum (isteğe bağlı)"
        placeholder="Paylaşmak istediğiniz bir not…"
        value={yorum}
        onChange={(e) => setYorum(e.target.value)}
      />

      <Btn onClick={() => void gonder()} disabled={loading}>
        {loading ? "Gönderiliyor…" : "Değerlendirmeyi Gönder"}
      </Btn>
    </div>
  );
}
