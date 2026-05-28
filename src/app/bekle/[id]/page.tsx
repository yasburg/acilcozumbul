"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";

type Durum =
  | "ihale_bekliyor"
  | "teklif_sec"
  | "cekici_bulundu"
  | "anlasma_bekliyor"
  | "tamamlandi"
  | "yeniden_araniyor";

interface TeklifOzet {
  id: string;
  cekiciAd: string;
  fiyat: number;
  tahminiSureDk: number;
  mesaj?: string;
}

export default function BeklePage() {
  const params = useParams();
  const id = params.id as string;
  const [durum, setDurum] = useState<Durum>("ihale_bekliyor");
  const [teklifler, setTeklifler] = useState<TeklifOzet[]>([]);
  const [cekiciAd, setCekiciAd] = useState<string | null>(null);
  const [kazananFiyat, setKazananFiyat] = useState<number | null>(null);
  const [islem, setIslem] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [ihaleBitis, setIhaleBitis] = useState<string | null>(null);

  useEffect(() => {
    const kontrol = async () => {
      try {
        const [durumRes, teklifRes] = await Promise.all([
          fetch(`/api/talep/${id}`),
          fetch(`/api/talep/${id}/teklifler`),
        ]);
        if (!durumRes.ok) return;
        const data = await durumRes.json();

        if (data.tamamlandi) {
          setDurum("tamamlandi");
          return;
        }

        if (data.yenidenAranıyor) {
          setDurum("yeniden_araniyor");
          setCekiciAd(null);
          setTeklifler([]);
          return;
        }

        if (data.kazananSecildi && data.anlasmaBekliyor) {
          setDurum("anlasma_bekliyor");
          setCekiciAd(data.cekiciAd ?? "Çekici");
          setKazananFiyat(data.kazananFiyat ?? null);
          return;
        }

        if (data.kazananSecildi) {
          setDurum("cekici_bulundu");
          setCekiciAd(data.cekiciAd ?? "Çekici");
          return;
        }

        if (teklifRes.ok) {
          const teklifData = await teklifRes.json();
          setTeklifler(teklifData.teklifler ?? []);
          setIhaleBitis(teklifData.ihaleBitis ?? null);
          if ((teklifData.teklifler?.length ?? 0) > 0) {
            setDurum("teklif_sec");
          } else {
            setDurum("ihale_bekliyor");
          }
        }
      } catch {
        /* sessiz */
      }
    };

    kontrol();
    const interval = setInterval(kontrol, 2500);
    return () => clearInterval(interval);
  }, [id]);

  async function teklifSec(teklifId: string) {
    setIslem(true);
    setMesaj("");
    try {
      const res = await fetch(`/api/talep/${id}/teklif-sec`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teklifId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCekiciAd(data.cekiciAd);
      setKazananFiyat(data.fiyat);
      setDurum("anlasma_bekliyor");
      setMesaj("Çekici seçildi. Kısa süre içinde sizi arayacak.");
    } catch (e) {
      setMesaj(e instanceof Error ? e.message : "Seçim başarısız.");
    } finally {
      setIslem(false);
    }
  }

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
        setTeklifler([]);
        setMesaj("İhale yeniden açıldı. Yeni teklifler bekleniyor.");
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
            <h2 className="text-xl font-bold text-slate-900">Çekici Seçildi!</h2>
            <p className="text-slate-600 mt-2 text-sm">
              <strong>{cekiciAd}</strong>
              {kazananFiyat != null && (
                <> · <span className="text-amber-600">{kazananFiyat} TL</span></>
              )}
              <br />
              Sizi arayacak veya aradı. Anlaşma durumunuzu bildirin:
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
        </div>
      </MobileShell>
    );
  }

  if (durum === "teklif_sec") {
    return (
      <MobileShell>
        <div className="space-y-4 py-2">
          <div className="text-center mb-2">
            <h2 className="text-xl font-bold text-slate-900">Gelen Teklifler</h2>
            <p className="text-slate-500 text-sm mt-1">
              Size en uygun teklifi seçin
            </p>
          </div>

          {mesaj && (
            <Card className="bg-amber-50 border-amber-200">
              <p className="text-sm text-amber-900">{mesaj}</p>
            </Card>
          )}

          <div className="space-y-2">
            {teklifler
              .sort((a, b) => a.fiyat - b.fiyat)
              .map((t) => (
                <Card key={t.id} className="border-slate-200">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{t.cekiciAd}</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">
                        {t.fiyat} TL
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Tahmini ~{t.tahminiSureDk} dk
                      </p>
                      {t.mesaj && (
                        <p className="text-sm text-slate-600 mt-2">{t.mesaj}</p>
                      )}
                    </div>
                    <Btn
                      onClick={() => teklifSec(t.id)}
                      disabled={islem}
                      className="shrink-0 !px-4 !py-2 text-sm"
                    >
                      Seç
                    </Btn>
                  </div>
                </Card>
              ))}
          </div>

          <Card>
            <p className="text-xs text-slate-500 leading-relaxed">
              Daha fazla teklif gelebilir. İhale süresi dolana kadar bekleyebilir
              veya mevcut tekliflerden birini seçebilirsiniz.
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
              Önceki çekici ile anlaşılamadı. İhale yeniden açıldı, teklifler bekleniyor…
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
          Çekiciler teklif veriyor
        </h2>
        <p className="text-slate-500 text-sm mb-2">
          {teklifler.length > 0
            ? `${teklifler.length} teklif alındı`
            : "Lütfen bekleyin…"}
        </p>
        {ihaleBitis && (
          <p className="text-xs text-slate-400 mb-6">
            İhale bitiş:{" "}
            {new Date(ihaleBitis).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
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
          Yakındaki çekicilere SMS gönderildi. Teklifler geldikçe burada listelenecek.
        </p>
      </div>
    </MobileShell>
  );
}
