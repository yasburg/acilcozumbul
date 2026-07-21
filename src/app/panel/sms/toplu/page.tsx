"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Btn, Card, Field, TextArea } from "@/components/ui";
import {
  NETGSM_TOPLU_SMS_BIRIM,
  NETGSM_TOPLU_SMS_MAX_BIRIM,
  netgsmSmsMesajGecerliMi,
} from "@/lib/sms-karakter";
import {
  elleTelefonEkle,
  excelAlicilariListeyeEkle,
  exceldenTopluSmsAliciOku,
  topluSmsExcelSablonIndir,
  type ExcelYukleOzet,
  type TopluSmsAlici,
} from "@/lib/toplu-sms-excel";
import { telefonMaskele } from "@/lib/telefon";

type Sekme = "gonder" | "listeler" | "genel";
type OncekiMod = "atla" | "yine";

type ListeOzet = {
  id: string;
  olusturulma: string;
  gonderenEposta: string | null;
  mesaj: string;
  aliciSayisi: number;
  basarili: number;
  basarisiz: number;
  mesajParca: number | null;
};

type GenelTelefon = {
  telefon: string;
  ad: string | null;
  ilkGonderim: string;
  sonGonderim: string;
  gonderimSayisi: number;
  basariliSayisi: number;
};

type ListeAlici = {
  telefon: string;
  ad: string | null;
  basarili: boolean;
  hata: string | null;
};

function tarihKisa(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function PanelTopluSmsPage() {
  const [sekme, setSekme] = useState<Sekme>("gonder");
  const [alicilar, setAlicilar] = useState<TopluSmsAlici[]>([]);
  const [elleTel, setElleTel] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [excelUyari, setExcelUyari] = useState("");
  const [excelOzet, setExcelOzet] = useState<ExcelYukleOzet | null>(null);
  const [elleHata, setElleHata] = useState("");
  const [gonderiyor, setGonderiyor] = useState(false);
  const [sonuc, setSonuc] = useState<{
    basarili: number;
    basarisiz: number;
    mesajParca?: number;
    oncekiAtlandi?: number;
  } | null>(null);
  const [hata, setHata] = useState("");

  const [oncekiSet, setOncekiSet] = useState<Set<string>>(new Set());
  const [oncekiKontrol, setOncekiKontrol] = useState(false);
  const [oncekiMod, setOncekiMod] = useState<OncekiMod>("atla");
  const [gecmisUyari, setGecmisUyari] = useState("");

  const [listeler, setListeler] = useState<ListeOzet[]>([]);
  const [genelTelefonlar, setGenelTelefonlar] = useState<GenelTelefon[]>([]);
  const [gecmisYukleniyor, setGecmisYukleniyor] = useState(false);
  const [gecmisHata, setGecmisHata] = useState("");
  const [acikListeId, setAcikListeId] = useState<string | null>(null);
  const [listeAlicilar, setListeAlicilar] = useState<ListeAlici[]>([]);
  const [listeAliciYukleniyor, setListeAliciYukleniyor] = useState(false);

  const mesajDurum = useMemo(() => netgsmSmsMesajGecerliMi(mesaj), [mesaj]);

  const gecerliAlicilar = useMemo(
    () => alicilar.filter((a) => !a.hata),
    [alicilar]
  );
  const hataliAlicilar = useMemo(
    () => alicilar.filter((a) => a.hata),
    [alicilar]
  );

  const oncekiAdet = useMemo(
    () => gecerliAlicilar.filter((a) => oncekiSet.has(a.telefon)).length,
    [gecerliAlicilar, oncekiSet]
  );
  const yeniAdet = gecerliAlicilar.length - oncekiAdet;
  const gonderilecekAdet =
    oncekiAdet > 0 && oncekiMod === "atla"
      ? yeniAdet
      : gecerliAlicilar.length;

  const oncekileriKontrolEt = useCallback(async (liste: TopluSmsAlici[]) => {
    const telefonlar = liste.filter((a) => !a.hata).map((a) => a.telefon);
    if (telefonlar.length === 0) {
      setOncekiSet(new Set());
      setGecmisUyari("");
      return;
    }
    setOncekiKontrol(true);
    try {
      const res = await fetch("/api/panel/sms/toplu/kontrol", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefonlar }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOncekiSet(new Set());
        return;
      }
      if (data.gecmisYok) {
        setGecmisUyari(String(data.uyari ?? ""));
        setOncekiSet(new Set());
        return;
      }
      setGecmisUyari("");
      setOncekiSet(new Set((data.oncekiler as string[]) ?? []));
      if ((data.adet as number) > 0) setOncekiMod("atla");
    } catch {
      setOncekiSet(new Set());
    } finally {
      setOncekiKontrol(false);
    }
  }, []);

  useEffect(() => {
    void oncekileriKontrolEt(alicilar);
  }, [alicilar, oncekileriKontrolEt]);

  async function gecmisYukle(tip: "listeler" | "genel") {
    setGecmisYukleniyor(true);
    setGecmisHata("");
    try {
      const res = await fetch(`/api/panel/sms/toplu/gecmis?tip=${tip}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Geçmiş yüklenemedi.");
      if (tip === "listeler") setListeler(data.listeler ?? []);
      else setGenelTelefonlar(data.telefonlar ?? []);
    } catch (e) {
      setGecmisHata(e instanceof Error ? e.message : "Geçmiş yüklenemedi.");
    } finally {
      setGecmisYukleniyor(false);
    }
  }

  useEffect(() => {
    if (sekme === "listeler") void gecmisYukle("listeler");
    if (sekme === "genel") void gecmisYukle("genel");
  }, [sekme]);

  async function listeDetayAc(id: string) {
    if (acikListeId === id) {
      setAcikListeId(null);
      setListeAlicilar([]);
      return;
    }
    setAcikListeId(id);
    setListeAliciYukleniyor(true);
    try {
      const res = await fetch(
        `/api/panel/sms/toplu/gecmis?tip=liste-alicilar&listeId=${encodeURIComponent(id)}`,
        { credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Alıcılar yüklenemedi.");
      setListeAlicilar(data.alicilar ?? []);
    } catch {
      setListeAlicilar([]);
    } finally {
      setListeAliciYukleniyor(false);
    }
  }

  async function excelYukle(file: File | null) {
    setExcelUyari("");
    setExcelOzet(null);
    setSonuc(null);
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const { alicilar: yeni, ozet: dosyaOzet, uyari } =
        exceldenTopluSmsAliciOku(buf);
      if (uyari) {
        setExcelUyari(uyari);
        return;
      }
      const { alicilar: birlesik, ozet } = excelAlicilariListeyeEkle(
        alicilar,
        yeni,
        dosyaOzet
      );
      setAlicilar(birlesik);
      setExcelOzet(ozet);
    } catch {
      setExcelUyari("Excel okunamadı. .xlsx veya .csv deneyin.");
      setExcelOzet(null);
    }
  }

  function elleEkle() {
    setElleHata("");
    const r = elleTelefonEkle(elleTel, alicilar);
    if (r.hata) {
      setElleHata(r.hata);
      return;
    }
    if (r.alici) {
      setAlicilar((a) => [...a, r.alici!]);
      setElleTel("");
    }
  }

  function aliciSil(telefon: string) {
    setAlicilar((a) => a.filter((x) => x.telefon !== telefon));
  }

  function listeyiTemizle() {
    setAlicilar([]);
    setSonuc(null);
    setHata("");
    setExcelOzet(null);
    setExcelUyari("");
    setOncekiSet(new Set());
  }

  async function gonder() {
    setHata("");
    setSonuc(null);
    if (!mesajDurum.gecerli) {
      setHata(mesajDurum.hata ?? "Mesaj geçersiz.");
      return;
    }
    if (gecerliAlicilar.length === 0) {
      setHata("En az bir geçerli alıcı ekleyin.");
      return;
    }
    if (gonderilecekAdet === 0) {
      setHata(
        "Öncekiler atlandığında gönderilecek numara kalmıyor. «Yine de gönder» seçin veya listeyi güncelleyin."
      );
      return;
    }

    const atlaMetin =
      oncekiAdet > 0 && oncekiMod === "atla"
        ? ` · ${oncekiAdet} önceki numara atlanacak`
        : oncekiAdet > 0 && oncekiMod === "yine"
          ? ` · ${oncekiAdet} önceki numara dahil`
          : "";

    const onay = window.confirm(
      `${gonderilecekAdet} numaraya SMS gönderilecek (${mesajDurum.parca} SMS parçası / numara)${atlaMetin}. Devam?`
    );
    if (!onay) return;

    setGonderiyor(true);
    try {
      const oturumRes = await fetch("/api/panel/oturum", {
        credentials: "include",
      });
      const oturum = await oturumRes.json().catch(() => ({ yetkili: false }));
      if (!oturum?.yetkili) {
        setHata("Oturum sona ermiş. Tekrar giriş yapıp yeniden deneyin.");
        return;
      }

      const adlar: Record<string, string> = {};
      for (const a of gecerliAlicilar) {
        if (a.ad) adlar[a.telefon] = a.ad;
      }

      const res = await fetch("/api/panel/sms/toplu", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesaj,
          telefonlar: gecerliAlicilar.map((a) => a.telefon),
          adlar,
          oncekileriAtla: oncekiAdet > 0 && oncekiMod === "atla",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error(
          "Oturum sona ermiş. Tekrar giriş yapıp yeniden deneyin."
        );
      }
      if (!res.ok) throw new Error(data.error ?? "Gönderim başarısız.");
      setSonuc({
        basarili: data.basarili ?? 0,
        basarisiz: data.basarisiz ?? 0,
        mesajParca: data.mesajParca,
        oncekiAtlandi: data.oncekiAtlandi,
      });
      if (data.gecmisUyari) setGecmisUyari(String(data.gecmisUyari));
      void oncekileriKontrolEt(alicilar);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Gönderim başarısız.");
    } finally {
      setGonderiyor(false);
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Toplu SMS</h2>
          <p className="text-sm text-slate-500">
            Excel / elle gönder · geçmiş listeler ve genel defter
          </p>
        </div>
        <Link
          href="/panel/sms"
          className="text-sm text-amber-600 font-medium self-end"
        >
          ← SMS sağlık
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["gonder", "Gönder"],
            ["listeler", "Listeler"],
            ["genel", "Genel liste"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSekme(id)}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              sekme === id
                ? "bg-amber-500 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sekme === "gonder" && (
        <>
          <Card className="space-y-3">
            <div className="flex flex-wrap justify-between gap-2 items-start">
              <div>
                <h3 className="font-semibold text-slate-800">Excel yükle</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Şablonu indirip doldurun. Sütunlar:{" "}
                  <code className="bg-slate-100 px-1 rounded">telefon</code>{" "}
                  (zorunlu),{" "}
                  <code className="bg-slate-100 px-1 rounded">ad</code>{" "}
                  (isteğe bağlı).
                </p>
              </div>
              <button
                type="button"
                onClick={() => topluSmsExcelSablonIndir()}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
              >
                Şablonu indir
              </button>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              onChange={(e) => {
                void excelYukle(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            {excelUyari && (
              <p className="text-sm text-amber-700">{excelUyari}</p>
            )}
            {excelOzet && (
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-sm text-slate-700 space-y-0.5">
                <p className="font-medium text-slate-900">
                  Yükleme özeti: {excelOzet.listeyeEklenen} numara listeye
                  eklendi
                </p>
                <p className="text-xs text-slate-500">
                  Dosyada {excelOzet.satirOkunan} satır ·{" "}
                  {excelOzet.gecerli} geçerli
                  {excelOzet.gecersiz > 0
                    ? ` · ${excelOzet.gecersiz} geçersiz`
                    : ""}
                  {excelOzet.tekrarAtlandi > 0
                    ? ` · ${excelOzet.tekrarAtlandi} dosya içi tekrar`
                    : ""}
                  {excelOzet.zatenListede > 0
                    ? ` · ${excelOzet.zatenListede} zaten listedeydi`
                    : ""}
                </p>
              </div>
            )}
          </Card>

          <Card className="space-y-3">
            <h3 className="font-semibold text-slate-800">Elle numara ekle</h3>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[12rem]">
                <Field
                  label="Telefon"
                  value={elleTel}
                  onChange={(e) => setElleTel(e.target.value)}
                  placeholder="0532 123 45 67"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      elleEkle();
                    }
                  }}
                />
              </div>
              <Btn type="button" variant="secondary" onClick={elleEkle}>
                Ekle
              </Btn>
            </div>
            {elleHata && <p className="text-sm text-red-600">{elleHata}</p>}
          </Card>

          <Card className="space-y-3">
            <div className="flex flex-wrap justify-between gap-2 items-baseline">
              <h3 className="font-semibold text-slate-800">
                Alıcılar{" "}
                <span className="text-sm font-normal text-slate-500">
                  ({gecerliAlicilar.length} geçerli
                  {hataliAlicilar.length > 0
                    ? ` · ${hataliAlicilar.length} hatalı`
                    : ""}
                  {oncekiAdet > 0 ? ` · ${oncekiAdet} daha önce gönderilmiş` : ""}
                  )
                </span>
              </h3>
              {alicilar.length > 0 && (
                <button
                  type="button"
                  onClick={listeyiTemizle}
                  className="text-xs text-red-600 font-medium"
                >
                  Listeyi temizle
                </button>
              )}
            </div>
            {alicilar.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz alıcı yok.</p>
            ) : (
              <ul className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-sm">
                {alicilar.map((a) => {
                  const onceki = !a.hata && oncekiSet.has(a.telefon);
                  return (
                    <li
                      key={`${a.telefon}-${a.kaynak}-${a.hata ?? ""}`}
                      className="flex items-center justify-between gap-2 py-2"
                    >
                      <div>
                        <p
                          className={
                            a.hata
                              ? "text-red-700 font-medium"
                              : "text-slate-900 font-medium"
                          }
                        >
                          {a.hata ? a.telefon : telefonMaskele(a.telefon)}
                          {a.ad ? (
                            <span className="text-slate-500 font-normal">
                              {" "}
                              · {a.ad}
                            </span>
                          ) : null}
                          {onceki ? (
                            <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              Önceki
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-slate-400">
                          {a.kaynak === "excel" ? "Excel" : "Elle"}
                          {a.hata ? ` · ${a.hata}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => aliciSil(a.telefon)}
                        className="text-xs text-slate-500 hover:text-red-600"
                      >
                        Sil
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {oncekiAdet > 0 && (
            <Card className="space-y-3 border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-950 font-medium">
                Listede daha önce gönderilmiş{" "}
                <strong>{oncekiAdet}</strong> numara var
                {oncekiKontrol ? " (kontrol…)" : ""}.
              </p>
              <p className="text-xs text-amber-800">
                Yeni: {yeniAdet} · Önceki: {oncekiAdet} · Toplam:{" "}
                {gecerliAlicilar.length}
              </p>
              <div className="flex flex-col gap-2">
                <label className="flex items-start gap-2 text-sm text-amber-950 cursor-pointer">
                  <input
                    type="radio"
                    name="onceki-mod"
                    checked={oncekiMod === "atla"}
                    onChange={() => setOncekiMod("atla")}
                    className="mt-1"
                  />
                  <span>
                    Daha önce gönderilmişlere gönderme —{" "}
                    <strong>{yeniAdet} kişiye</strong> SMS gider
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-amber-950 cursor-pointer">
                  <input
                    type="radio"
                    name="onceki-mod"
                    checked={oncekiMod === "yine"}
                    onChange={() => setOncekiMod("yine")}
                    className="mt-1"
                  />
                  <span>
                    Yine de gönder —{" "}
                    <strong>{gecerliAlicilar.length} kişiye</strong> SMS gider
                    (öncekiler dahil)
                  </span>
                </label>
              </div>
            </Card>
          )}

          {gecmisUyari && (
            <Card className="border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-600">{gecmisUyari}</p>
            </Card>
          )}

          <Card className="space-y-3">
            <TextArea
              label="SMS metni"
              value={mesaj}
              onChange={(e) => setMesaj(e.target.value)}
              rows={5}
              placeholder="Gönderilecek mesaj…"
              maxLength={NETGSM_TOPLU_SMS_MAX_BIRIM}
            />
            <div className="flex flex-wrap justify-between gap-2 text-xs">
              <p className="text-slate-500">
                Netgsm Türkçe: 1 SMS = {NETGSM_TOPLU_SMS_BIRIM} birim · ç/ğ/ı/ş =
                2 birim · üst sınır {NETGSM_TOPLU_SMS_MAX_BIRIM} birim (
                {NETGSM_TOPLU_SMS_MAX_BIRIM / NETGSM_TOPLU_SMS_BIRIM} SMS)
              </p>
              <p
                className={
                  mesajDurum.birim > NETGSM_TOPLU_SMS_MAX_BIRIM
                    ? "text-red-600 font-semibold"
                    : mesajDurum.parca > 1
                      ? "text-amber-700 font-medium"
                      : "text-slate-600"
                }
              >
                {mesajDurum.birim} / {NETGSM_TOPLU_SMS_MAX_BIRIM} birim ·{" "}
                {mesajDurum.parca || 0} SMS
                {mesajDurum.parca > 1 ? " (uzun SMS)" : ""}
              </p>
            </div>
            {mesajDurum.hata && mesaj.trim() && (
              <p className="text-sm text-red-600">{mesajDurum.hata}</p>
            )}
          </Card>

          {hata && (
            <Card className="border-red-200 bg-red-50">
              <p className="text-sm text-red-700">{hata}</p>
            </Card>
          )}

          {sonuc && (
            <Card className="border-emerald-200 bg-emerald-50">
              <p className="text-sm text-emerald-900 font-medium">
                Gönderim tamamlandı: {sonuc.basarili} başarılı
                {sonuc.basarisiz > 0 ? `, ${sonuc.basarisiz} başarısız` : ""}
                {sonuc.oncekiAtlandi
                  ? ` · ${sonuc.oncekiAtlandi} önceki atlandı`
                  : ""}
                {sonuc.mesajParca
                  ? ` · mesaj ${sonuc.mesajParca} SMS parçası`
                  : ""}
              </p>
              <button
                type="button"
                className="text-xs text-amber-700 font-medium mt-1"
                onClick={() => setSekme("listeler")}
              >
                Geçmiş listelere bak →
              </button>
            </Card>
          )}

          <Btn
            type="button"
            disabled={
              gonderiyor ||
              gonderilecekAdet === 0 ||
              !mesajDurum.gecerli
            }
            onClick={() => void gonder()}
          >
            {gonderiyor
              ? "Gönderiliyor…"
              : `${gonderilecekAdet} kişiye SMS gönder`}
          </Btn>
        </>
      )}

      {sekme === "listeler" && (
        <Card className="space-y-3">
          <div className="flex justify-between items-center gap-2">
            <h3 className="font-semibold text-slate-800">
              Gönderim listeleri
            </h3>
            <button
              type="button"
              className="text-xs text-amber-700 font-medium"
              onClick={() => void gecmisYukle("listeler")}
            >
              Yenile
            </button>
          </div>
          {gecmisYukleniyor && (
            <p className="text-sm text-slate-500">Yükleniyor…</p>
          )}
          {gecmisHata && (
            <p className="text-sm text-red-600">{gecmisHata}</p>
          )}
          {!gecmisYukleniyor && !gecmisHata && listeler.length === 0 && (
            <p className="text-sm text-slate-500">Henüz kayıtlı liste yok.</p>
          )}
          <ul className="divide-y divide-slate-100">
            {listeler.map((l) => (
              <li key={l.id} className="py-3 space-y-2">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => void listeDetayAc(l.id)}
                >
                  <p className="text-sm font-medium text-slate-900">
                    {tarihKisa(l.olusturulma)} · {l.aliciSayisi} alıcı
                    <span className="text-emerald-700">
                      {" "}
                      · {l.basarili} ok
                    </span>
                    {l.basarisiz > 0 ? (
                      <span className="text-red-600">
                        {" "}
                        · {l.basarisiz} hata
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    {l.mesaj}
                  </p>
                  {l.gonderenEposta && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {l.gonderenEposta}
                    </p>
                  )}
                </button>
                {acikListeId === l.id && (
                  <div className="rounded-lg bg-slate-50 p-2 max-h-48 overflow-y-auto">
                    {listeAliciYukleniyor ? (
                      <p className="text-xs text-slate-500">Alıcılar…</p>
                    ) : listeAlicilar.length === 0 ? (
                      <p className="text-xs text-slate-500">Alıcı yok.</p>
                    ) : (
                      <ul className="text-xs space-y-1">
                        {listeAlicilar.map((a) => (
                          <li
                            key={a.telefon}
                            className="flex justify-between gap-2"
                          >
                            <span>
                              {telefonMaskele(a.telefon)}
                              {a.ad ? ` · ${a.ad}` : ""}
                            </span>
                            <span
                              className={
                                a.basarili ? "text-emerald-700" : "text-red-600"
                              }
                            >
                              {a.basarili ? "OK" : a.hata ?? "Hata"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {sekme === "genel" && (
        <Card className="space-y-3">
          <div className="flex justify-between items-center gap-2">
            <h3 className="font-semibold text-slate-800">
              Genel telefon defteri{" "}
              <span className="text-sm font-normal text-slate-500">
                ({genelTelefonlar.length})
              </span>
            </h3>
            <button
              type="button"
              className="text-xs text-amber-700 font-medium"
              onClick={() => void gecmisYukle("genel")}
            >
              Yenile
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Daha önce toplu SMS gönderilen tüm numaralar (son gönderime göre).
          </p>
          {gecmisYukleniyor && (
            <p className="text-sm text-slate-500">Yükleniyor…</p>
          )}
          {gecmisHata && (
            <p className="text-sm text-red-600">{gecmisHata}</p>
          )}
          {!gecmisYukleniyor &&
            !gecmisHata &&
            genelTelefonlar.length === 0 && (
              <p className="text-sm text-slate-500">Henüz kayıt yok.</p>
            )}
          <ul className="max-h-[28rem] overflow-y-auto divide-y divide-slate-100 text-sm">
            {genelTelefonlar.map((t) => (
              <li
                key={t.telefon}
                className="flex flex-wrap justify-between gap-2 py-2"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {telefonMaskele(t.telefon)}
                    {t.ad ? (
                      <span className="text-slate-500 font-normal">
                        {" "}
                        · {t.ad}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-400">
                    Son: {tarihKisa(t.sonGonderim)} · İlk:{" "}
                    {tarihKisa(t.ilkGonderim)}
                  </p>
                </div>
                <p className="text-xs text-slate-600 tabular-nums">
                  {t.gonderimSayisi} gönderim
                  {t.basariliSayisi > 0
                    ? ` · ${t.basariliSayisi} başarılı`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
