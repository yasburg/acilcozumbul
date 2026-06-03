"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";
import { MemnuniyetBekle } from "@/components/MemnuniyetBekle";
import { MemnuniyetFormu } from "@/components/MemnuniyetFormu";
import { PuanGostergesi } from "@/components/PuanGostergesi";
import { IhaleBekleAnimasyon } from "@/components/IhaleBekleAnimasyon";
import { MusteriCekiciTakipHarita } from "@/components/MusteriCekiciTakipHarita";
import { koordinatGecerli } from "@/lib/koordinat";
import {
  musteriBildirimIzniIste,
  musteriYeniTeklifBildir,
} from "@/lib/musteri-bildirim";

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
  ilkFiyat: number;
  fiyatDegisti: boolean;
  secilebilir: boolean;
  tahminiSureDk: number;
  mesaj?: string;
  tercihPuani: number | null;
  tercihYuzde: number | null;
  hizmetPuani: number | null;
  hizmetDegerlendirmeAdet?: number;
  fiyatGarantiPuani: number;
  fiyatGarantiYuzde: number;
}

interface MemnuniyetState {
  degerlendirildi: boolean;
  formAcik: boolean;
  beklemede: boolean;
  kalanMs: number;
  puan?: number;
  puanGenel?: number;
  puanFiyat?: number;
  puanSure?: number;
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
  const [memnuniyet, setMemnuniyet] = useState<MemnuniyetState | null>(null);
  const [memnuniyetYenile, setMemnuniyetYenile] = useState(0);
  const [operatorSayisi, setOperatorSayisi] = useState(0);
  const [animasyonBitti, setAnimasyonBitti] = useState(false);
  const [musteriKonum, setMusteriKonum] = useState<{
    lat: number;
    lng: number;
    adres: string;
  } | null>(null);
  const [hedefKonum, setHedefKonum] = useState<{
    lat: number;
    lng: number;
    adres: string;
  } | null>(null);
  const oncekiTeklifSayisi = useRef(0);

  useEffect(() => {
    try {
      const kayitli = sessionStorage.getItem(`acil_bekle_${id}`);
      if (kayitli != null) setOperatorSayisi(Number(kayitli) || 0);
    } catch {
      /* ignore */
    }
    void musteriBildirimIzniIste();
  }, [id]);

  useEffect(() => {
    let aktif = true;
    let zamanlayici: ReturnType<typeof setTimeout> | undefined;

    const planla = (ms: number) => {
      if (!aktif) return;
      zamanlayici = setTimeout(() => void kontrol(), ms);
    };

    const kontrol = async () => {
      if (!aktif) return;
      try {
        const durumRes = await fetch(`/api/talep/${id}`);
        if (!durumRes.ok) {
          planla(8000);
          return;
        }
        const data = await durumRes.json();

        if (data.bildirilenSayisi != null) {
          setOperatorSayisi(data.bildirilenSayisi);
        }
        if (data.konum) setMusteriKonum(data.konum);
        if (data.hedefKonum) setHedefKonum(data.hedefKonum);

        if (data.tamamlandi) {
          setDurum("tamamlandi");
          setCekiciAd(data.cekiciAd ?? null);
          let mem = data.memnuniyet ?? null;
          if (!mem) {
            const mRes = await fetch(`/api/talep/${id}/memnuniyet`);
            if (mRes.ok) mem = await mRes.json();
          }
          if (mem) setMemnuniyet(mem);
          if (mem?.degerlendirildi || mem?.formAcik) return;
          if (mem?.beklemede) planla(10000);
          return;
        }

        if (data.yenidenAranıyor) {
          setDurum("yeniden_araniyor");
          setCekiciAd(null);
          setTeklifler([]);
          setAnimasyonBitti(false);
          oncekiTeklifSayisi.current = 0;
          const teklifRes = await fetch(`/api/talep/${id}/teklifler`);
          if (teklifRes.ok) {
            const teklifData = await teklifRes.json();
            setTeklifler(teklifData.teklifler ?? []);
            setIhaleBitis(teklifData.ihaleBitis ?? null);
          }
          planla(4000);
          return;
        }

        if (data.kazananSecildi && data.anlasmaBekliyor) {
          setDurum("anlasma_bekliyor");
          setCekiciAd(data.cekiciAd ?? "Çekici");
          setKazananFiyat(data.kazananFiyat ?? null);
          planla(8000);
          return;
        }

        if (data.kazananSecildi) {
          setDurum("cekici_bulundu");
          setCekiciAd(data.cekiciAd ?? "Çekici");
          planla(8000);
          return;
        }

        const teklifRes = await fetch(`/api/talep/${id}/teklifler`);
        if (teklifRes.ok) {
          const teklifData = await teklifRes.json();
          const yeniSayi = teklifData.teklifler?.length ?? 0;
          if (yeniSayi > oncekiTeklifSayisi.current && yeniSayi > 0) {
            const son = teklifData.teklifler[teklifData.teklifler.length - 1];
            if (son) {
              musteriYeniTeklifBildir(son.fiyat, son.cekiciAd);
            }
          }
          oncekiTeklifSayisi.current = yeniSayi;
          setTeklifler(teklifData.teklifler ?? []);
          setIhaleBitis(teklifData.ihaleBitis ?? null);
          if (yeniSayi > 0) {
            setAnimasyonBitti(true);
            setDurum("teklif_sec");
          } else {
            setDurum("ihale_bekliyor");
          }
        }
        planla(4000);
      } catch {
        planla(8000);
      }
    };

    void kontrol();
    return () => {
      aktif = false;
      if (zamanlayici) clearTimeout(zamanlayici);
    };
  }, [id, memnuniyetYenile]);

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
      if (!res.ok) {
        if (data.fiyatDegisti) {
          setMesaj(data.error);
        }
        throw new Error(data.error);
      }
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
        const mRes = await fetch(`/api/talep/${id}/memnuniyet`);
        if (mRes.ok) setMemnuniyet(await mRes.json());
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
    const formAcik = memnuniyet?.formAcik && !memnuniyet.degerlendirildi;
    const bekle = memnuniyet?.beklemede && !memnuniyet.degerlendirildi;
    const degerlendirildi = memnuniyet?.degerlendirildi;

    return (
      <MobileShell>
        <div className="space-y-6 py-4 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-emerald-700">İşlem Tamamlandı</h2>
            <p className="text-slate-600 text-sm mt-2">
              Çekici ile anlaştınız. Güvenli yolculuklar dileriz.
            </p>
          </div>

          {degerlendirildi && (
            <Card className="bg-emerald-50 border-emerald-200 text-center py-4 space-y-1">
              <p className="text-sm text-emerald-800 font-medium">
                ✓ Değerlendirmeniz alındı
              </p>
              {memnuniyet?.puanGenel != null && (
                <p className="text-xs text-emerald-700">
                  Genel {memnuniyet.puanGenel}/5 · Fiyat {memnuniyet.puanFiyat}/5
                  · Süre {memnuniyet.puanSure}/5
                </p>
              )}
            </Card>
          )}

          {bekle && memnuniyet && (
            <MemnuniyetBekle
              kalanMs={memnuniyet.kalanMs}
              onSureDoldu={() => setMemnuniyetYenile((n) => n + 1)}
            />
          )}

          {formAcik && (
            <MemnuniyetFormu
              talepId={id}
              cekiciAd={cekiciAd ?? undefined}
              onTamamlandi={() => setMemnuniyetYenile((n) => n + 1)}
            />
          )}

          {!memnuniyet && (
            <p className="text-xs text-slate-400 text-center">
              Değerlendirme durumu yükleniyor…
            </p>
          )}
        </div>
      </MobileShell>
    );
  }

  if (durum === "anlasma_bekliyor") {
    const takipKonum =
      musteriKonum && koordinatGecerli(musteriKonum) ? musteriKonum : null;
    const takipHedef =
      hedefKonum && koordinatGecerli(hedefKonum) ? hedefKonum : null;

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

          {takipKonum && (
            <MusteriCekiciTakipHarita
              talepId={id}
              musteriKonum={takipKonum}
              hedefKonum={takipHedef}
            />
          )}

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

          <div className="space-y-3">
            {teklifler
              .sort((a, b) => a.fiyat - b.fiyat)
              .map((t) => (
                <Card
                  key={t.id}
                  className={`border-slate-200 overflow-hidden ${
                    t.fiyatDegisti ? "border-red-200 bg-red-50/30" : ""
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <PuanGostergesi
                        label="Tercih puanı"
                        puan={t.tercihPuani}
                        yuzde={t.tercihYuzde}
                        yuzdeEtiket="müşteri tercihi"
                        variant="amber"
                      />
                      <PuanGostergesi
                        label="Hizmet puanı"
                        puan={t.hizmetPuani}
                        altMetin={
                          t.hizmetDegerlendirmeAdet
                            ? `${t.hizmetDegerlendirmeAdet} değerlendirme`
                            : undefined
                        }
                        variant="blue"
                      />
                      <PuanGostergesi
                        label="Fiyat garantisi"
                        puan={t.fiyatGarantiPuani}
                        yuzde={t.fiyatGarantiYuzde}
                        yuzdeEtiket="sabit fiyat"
                        variant="emerald"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">{t.cekiciAd}</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">
                        {t.fiyat} TL
                      </p>
                      {t.fiyatDegisti && t.ilkFiyat !== t.fiyat && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          ⚠️ İlk teklif {t.ilkFiyat} TL idi — fiyat değiştirildi
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Tahmini ~{t.tahminiSureDk} dk
                      </p>
                      {t.mesaj?.trim() && (
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                          {t.mesaj}
                        </p>
                      )}
                    </div>

                    {t.fiyatDegisti ? (
                      <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-800 leading-relaxed">
                        Bu çekici teklif fiyatını sonradan değiştirdi. Güvenlik
                        nedeniyle bu teklifle anlaşamazsınız.
                      </div>
                    ) : (
                      <Btn
                        onClick={() => teklifSec(t.id)}
                        disabled={islem || !t.secilebilir}
                        className="!py-3 text-sm"
                      >
                        Bu teklifi seç
                      </Btn>
                    )}
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
      <div className="flex flex-col items-center justify-center min-h-[65dvh] text-center px-4">
        {durum === "yeniden_araniyor" && (
          <Card className="w-full mb-6 bg-amber-50 border-amber-200">
            <p className="text-sm text-amber-900">
              Önceki çekici ile anlaşılamadı. İhale yeniden açıldı, teklifler bekleniyor…
            </p>
          </Card>
        )}

        {!animasyonBitti && teklifler.length === 0 ? (
          <IhaleBekleAnimasyon
            operatorSayisi={operatorSayisi}
            onTamamlandi={() => setAnimasyonBitti(true)}
          />
        ) : (
          <>
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-ping" />
              <div className="absolute inset-4 rounded-full border-4 border-amber-400/60 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center text-5xl animate-bounce">
                🚛
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {teklifler.length > 0
                ? "Teklifler geliyor"
                : "Çekiciler teklif veriyor"}
            </h2>
          </>
        )}

        <p className="text-slate-500 text-sm mb-2">
          {teklifler.length > 0
            ? `${teklifler.length} teklif alındı`
            : animasyonBitti
              ? "Teklifler bekleniyor…"
              : "Operatörler bilgilendiriliyor…"}
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
        {(animasyonBitti || teklifler.length > 0) && (
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-10 max-w-xs">
          {operatorSayisi > 0
            ? `${operatorSayisi} operatöre bildirim gönderildi. Yeni teklif gelince SMS alabilirsiniz.`
            : "Yakındaki operatörler aranıyor. Teklifler geldikçe burada listelenecek."}
        </p>
      </div>
    </MobileShell>
  );
}
