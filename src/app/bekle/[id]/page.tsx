"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";

type Durum =
  | "bekliyor"
  | "cekici_bulundu"
  | "anlasma_bekliyor"
  | "tamamlandi"
  | "yeniden_araniyor";

export default function BeklePage() {
  const params = useParams();
  const id = params.id as string;
  const [durum, setDurum] = useState<Durum>("bekliyor");
  const [cekiciAd, setCekiciAd] = useState<string | null>(null);
  const [islem, setIslem] = useState(false);
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    const kontrol = async () => {
      try {
        const res = await fetch(`/api/talep/${id}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.tamamlandi) {
          setDurum("tamamlandi");
          return;
        }

        if (data.yenidenAranıyor) {
          setDurum("yeniden_araniyor");
          setCekiciAd(null);
          return;
        }

        if (data.satinAlindi && data.anlasmaBekliyor) {
          setDurum("anlasma_bekliyor");
          setCekiciAd(data.cekiciAd ?? "Çekici");
          return;
        }

        if (data.satinAlindi) {
          setDurum("cekici_bulundu");
          setCekiciAd(data.cekiciAd ?? "Çekici");
        }
      } catch {
        /* sessiz */
      }
    };

    kontrol();
    const interval = setInterval(kontrol, 2000);
    return () => clearInterval(interval);
  }, [id]);

  async function anlasmaBildir(sonuc: "anlasti" | "anlasamadi") {
    setIslem(true);
    setMesaj("");
    try {
      const res = await fetch(`/api/talep/${id}/anlasma`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sonuc }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (sonuc === "anlasti") {
        setDurum("tamamlandi");
        setMesaj("Anlaşma kaydedildi. İyi yolculuklar!");
      } else {
        setDurum("yeniden_araniyor");
        setCekiciAd(null);
        setMesaj("Başka çekici aranıyor. Lütfen bekleyin.");
      }
    } catch (e) {
      setMesaj(e instanceof Error ? e.message : "İşlem başarısız.");
    } finally {
      setIslem(false);
    }
  }

  if (durum === "tamamlandi") {
    return (
      <MobileShell>
        <div className="flex flex-col items-center justify-center min-h-[60dvh] text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold text-emerald-700">İşlem Tamamlandı</h2>
          <p className="text-slate-600 max-w-xs">
            Çekici ile anlaştınız. Güvenli yolculuklar dileriz.
          </p>
        </div>
      </MobileShell>
    );
  }

  if (durum === "anlasma_bekliyor") {
    return (
      <MobileShell>
        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🚛</div>
            <h2 className="text-xl font-bold text-slate-900">Çekici Bulundu!</h2>
            <p className="text-slate-600 mt-2 text-sm">
              <strong>{cekiciAd}</strong> sizi arayacak veya aradı. Anlaşma
              durumunuzu bildirin:
            </p>
          </div>

          {mesaj && (
            <Card className="bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-900">{mesaj}</p>
            </Card>
          )}

          <Btn variant="success" onClick={() => anlasmaBildir("anlasti")} disabled={islem}>
            ✅ Çekici ile anlaştım
          </Btn>
          <Btn variant="danger" onClick={() => anlasmaBildir("anlasamadi")} disabled={islem}>
            ❌ Anlaşamadım — başka çekici ara
          </Btn>

          <Card>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anlaşamazsanız talebiniz tekrar açılır ve başka çekicilere iletilir.
            </p>
          </Card>
        </div>
      </MobileShell>
    );
  }

  if (durum === "cekici_bulundu") {
    return (
      <MobileShell>
        <div className="flex flex-col items-center justify-center min-h-[60dvh] text-center space-y-6">
          <div className="text-6xl">✅</div>
          <h2 className="text-2xl font-bold text-emerald-700">Çekici Bulundu!</h2>
          <p className="text-slate-600 max-w-xs">
            {cekiciAd} talebinizi aldı. Kısa süre içinde sizi arayacak.
          </p>
          <Card className="w-full">
            <p className="text-sm text-slate-500">
              Telefonunuzu açık tutun. Anlaşma sonrası bildirim ekranı gelecektir.
            </p>
          </Card>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="flex flex-col items-center justify-center min-h-[65dvh] text-center">
        {durum === "yeniden_araniyor" && (
          <Card className="w-full mb-6 bg-amber-50 border-amber-200">
            <p className="text-sm text-amber-900">
              Önceki çekici ile anlaşılamadı. Yeni çekici aranıyor…
            </p>
          </Card>
        )}

        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-ping" />
          <div className="absolute inset-4 rounded-full border-4 border-amber-400/60 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">
            🚛
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Size en yakın çekici bulunuyor
        </h2>
        <p className="text-slate-500 text-sm mb-6">Lütfen bekleyin…</p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-10 max-w-xs">
          Yakındaki çekicilere SMS gönderildi. İlk kabul eden size ulaşacak.
        </p>
      </div>
    </MobileShell>
  );
}
