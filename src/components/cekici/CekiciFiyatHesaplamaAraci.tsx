"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Card, SelectField, Spinner } from "@/components/ui";
import { DESTEKLENEN_ILLER, ilceListesi } from "@/lib/il-ilce";
import { geocodeAdres } from "@/lib/konum-client";
import { illerSecimSirasi } from "@/lib/turkiye-il-nufus";
import {
  CEKICI_ARAC_DURUMLARI,
  CEKICI_ARAC_TIPLERI,
  CEKICI_SAAT_DILIMLERI,
  cekiciFiyatTahmini,
  mesafeKapsamBul,
  rotaMesafeKm,
  tlYazi,
  type CekiciAracTipiId,
  type CekiciDurumId,
  type CekiciFiyatSonuc,
  type CekiciSaatId,
  type LatLngNokta,
} from "@/lib/cekici-fiyat-hesaplama";
import { fiyatHesaplamaTalepTaslagi } from "@/lib/fiyat-hesaplama-talep";
import { musteriFormTaslakKaydet } from "@/lib/musteri-form-taslak";

const ILLER = illerSecimSirasi(DESTEKLENEN_ILLER);

async function noktaGeocode(
  il: string,
  ilce: string
): Promise<LatLngNokta | null> {
  const sorgu = ilce ? `${ilce}, ${il}, Türkiye` : `${il}, Türkiye`;
  const g = await geocodeAdres(sorgu);
  return g ? { lat: g.lat, lng: g.lng } : null;
}

export function CekiciFiyatHesaplamaAraci() {
  const router = useRouter();
  const [cikisIl, setCikisIl] = useState("İstanbul");
  const [cikisIlce, setCikisIlce] = useState("Kadıköy");
  const [varisIl, setVarisIl] = useState("İstanbul");
  const [varisIlce, setVarisIlce] = useState("Beşiktaş");
  const [aracTipi, setAracTipi] = useState<CekiciAracTipiId>("otomobil");
  const [saat, setSaat] = useState<CekiciSaatId>("gunduz");
  const [durum, setDurum] = useState<CekiciDurumId>("standart");
  const [otoyolGecis, setOtoyolGecis] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mesafeKm, setMesafeKm] = useState<number | null>(null);
  const [sonuc, setSonuc] = useState<CekiciFiyatSonuc | null>(null);
  const [cikisKoordinat, setCikisKoordinat] = useState<LatLngNokta | null>(
    null
  );
  const [varisKoordinat, setVarisKoordinat] = useState<LatLngNokta | null>(
    null
  );

  const formHazir = useMemo(
    () => Boolean(cikisIl && cikisIlce && varisIl && varisIlce),
    [cikisIl, cikisIlce, varisIl, varisIlce]
  );

  const cikisIlceler = cikisIl ? ilceListesi(cikisIl) : [];
  const varisIlceler = varisIl ? ilceListesi(varisIl) : [];

  function sifirlaSonuc() {
    setSonuc(null);
    setMesafeKm(null);
    setHata("");
    setCikisKoordinat(null);
    setVarisKoordinat(null);
  }

  function gercekTeklifAl() {
    const taslak = fiyatHesaplamaTalepTaslagi({
      cikisIl,
      cikisIlce,
      varisIl,
      varisIlce,
      cikisKoordinat,
      varisKoordinat,
      aracTipi,
      durum,
    });
    if (!taslak) {
      router.push("/?hizmet=arac-tasima");
      return;
    }
    musteriFormTaslakKaydet(taslak);
    try {
      sessionStorage.setItem("acb_hero_intro_seen", "1");
    } catch {
      /* ignore */
    }
    router.push("/?hizmet=arac-tasima");
  }

  async function hesapla() {
    if (!formHazir) {
      setHata("Çıkış ve varış için il ve ilçe seçin.");
      return;
    }
    setYukleniyor(true);
    setHata("");
    setSonuc(null);

    let aKoord: LatLngNokta | null = null;
    let bKoord: LatLngNokta | null = null;
    try {
      aKoord = await noktaGeocode(cikisIl, cikisIlce);
      await new Promise((r) => setTimeout(r, 1100));
      bKoord = await noktaGeocode(varisIl, varisIlce);
    } catch {
      /* yerel koordinat yedeği */
    }

    const km = rotaMesafeKm({
      cikisIl,
      cikisIlce,
      varisIl,
      varisIlce,
      cikisKoordinat: aKoord,
      varisKoordinat: bKoord,
    });

    if (km == null) {
      setHata("Mesafe hesaplanamadı. İl seçimlerini kontrol edin.");
      setYukleniyor(false);
      return;
    }

    const kapsam = mesafeKapsamBul(cikisIl, varisIl);
    const fiyat = cekiciFiyatTahmini({
      sehirAd: cikisIl,
      kapsam,
      mesafeKm: km,
      aracTipi,
      saat,
      durum,
      otoyolGecis,
    });

    setMesafeKm(km);
    setSonuc(fiyat);
    setCikisKoordinat(aKoord);
    setVarisKoordinat(bKoord);
    setYukleniyor(false);
  }

  return (
    <Card className="space-y-4 sm:!p-5">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-800">
          A — Çıkış noktası
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <SelectField
            label="İl"
            className="!py-2.5"
            value={cikisIl}
            onChange={(e) => {
              setCikisIl(e.target.value);
              setCikisIlce("");
              sifirlaSonuc();
            }}
          >
            <option value="">İl seçin</option>
            {ILLER.map((il) => (
              <option key={il} value={il}>
                {il}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="İlçe"
            className="!py-2.5"
            value={cikisIlce}
            disabled={!cikisIl}
            onChange={(e) => {
              setCikisIlce(e.target.value);
              sifirlaSonuc();
            }}
          >
            <option value="">{cikisIl ? "İlçe seçin" : "Önce il"}</option>
            {cikisIlceler.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-800">
          B — Varış noktası
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <SelectField
            label="İl"
            className="!py-2.5"
            value={varisIl}
            onChange={(e) => {
              setVarisIl(e.target.value);
              setVarisIlce("");
              sifirlaSonuc();
            }}
          >
            <option value="">İl seçin</option>
            {ILLER.map((il) => (
              <option key={il} value={il}>
                {il}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="İlçe"
            className="!py-2.5"
            value={varisIlce}
            disabled={!varisIl}
            onChange={(e) => {
              setVarisIlce(e.target.value);
              sifirlaSonuc();
            }}
          >
            <option value="">{varisIl ? "İlçe seçin" : "Önce il"}</option>
            {varisIlceler.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      <SelectField
        label="Taşınacak araç tipi"
        value={aracTipi}
        onChange={(e) => {
          setAracTipi(e.target.value as CekiciAracTipiId);
          sifirlaSonuc();
        }}
      >
        {CEKICI_ARAC_TIPLERI.map((a) => (
          <option key={a.id} value={a.id}>
            {a.etiket}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Hizmet saati"
        value={saat}
        onChange={(e) => {
          setSaat(e.target.value as CekiciSaatId);
          sifirlaSonuc();
        }}
      >
        {CEKICI_SAAT_DILIMLERI.map((a) => (
          <option key={a.id} value={a.id}>
            {a.etiket}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Araç durumu"
        value={durum}
        onChange={(e) => {
          setDurum(e.target.value as CekiciDurumId);
          sifirlaSonuc();
        }}
      >
        {CEKICI_ARAC_DURUMLARI.map((a) => (
          <option key={a.id} value={a.id}>
            {a.etiket}
          </option>
        ))}
      </SelectField>

      <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={otoyolGecis}
          onChange={(e) => {
            setOtoyolGecis(e.target.checked);
            sifirlaSonuc();
          }}
          className="size-4 accent-amber-500"
        />
        Otoyol / köprü geçişi bekleniyor
      </label>

      {hata ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {hata}
        </p>
      ) : null}

      <Btn
        type="button"
        onClick={() => void hesapla()}
        disabled={yukleniyor || !formHazir}
        className="w-full"
      >
        {yukleniyor ? (
          <span className="inline-flex items-center gap-2">
            <Spinner /> Mesafe hesaplanıyor…
          </span>
        ) : (
          "Fiyat bandını hesapla"
        )}
      </Btn>

      {sonuc && mesafeKm != null ? (
        <div className="space-y-4 border-t border-slate-100 pt-4">
          <Card className="!rounded-xl bg-slate-50 !shadow-none">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                {cikisIlce}, {cikisIl}
              </span>
              <span className="mx-1.5 text-slate-400">→</span>
              <span className="font-semibold text-slate-900">
                {varisIlce}, {varisIl}
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tahmini yol mesafesi:{" "}
              <strong className="text-slate-800">{mesafeKm} km</strong>
              {" · "}
              {mesafeKapsamBul(cikisIl, varisIl) === "sehir_ici"
                ? "Şehir içi"
                : "Şehirler arası"}
            </p>
          </Card>

          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tahmini çekici fiyat bandı
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Card className="!rounded-xl !p-3 !shadow-none bg-slate-50">
              <p className="text-[11px] text-slate-500">Düşük</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {tlYazi(sonuc.dusuk)}
              </p>
            </Card>
            <Card className="!rounded-xl !p-3 !shadow-none bg-amber-50 border-amber-200">
              <p className="text-[11px] text-amber-800">Ortalama</p>
              <p className="mt-1 text-base font-bold text-amber-950">
                {tlYazi(sonuc.orta)}
              </p>
            </Card>
            <Card className="!rounded-xl !p-3 !shadow-none bg-slate-50">
              <p className="text-[11px] text-slate-500">Yüksek</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {tlYazi(sonuc.yuksek)}
              </p>
            </Card>
          </div>

          <p className="text-sm text-slate-600">
            Yaklaşık km başı:{" "}
            <strong className="text-slate-900">
              {tlYazi(sonuc.kmBasiOrtalama)}
            </strong>
          </p>
          <ul className="space-y-1 text-xs text-slate-500">
            {sonuc.ozet.map((o) => (
              <li key={o}>· {o}</li>
            ))}
          </ul>
          <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
            Mesafe A→B seçiminden hesaplanır; fiyat bandı tahmindir. Kesin ücreti
            yakındaki çekicilerden teklif alarak seçersiniz.
          </p>
          <Btn
            type="button"
            className="w-full"
            onClick={() => gercekTeklifAl()}
          >
            Gerçek teklif al
          </Btn>
        </div>
      ) : null}
    </Card>
  );
}
