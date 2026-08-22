"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { Btn, Card, Field, TextArea } from "@/components/ui";
import {
  KREDI_TANIM_PH,
  KREDI_TANIM_SABLON_GOVDE,
  krediTanimSmsMesaji,
  type KrediDagitimUcDurum,
} from "@/lib/panel-kredi-dagitim";
import { netgsmSmsMesajGecerliMi } from "@/lib/sms-karakter";

type Satir = {
  id: string;
  ad: string;
  telefon: string;
  sehir: string;
  kredi: number;
  abonelikKredi: number;
  toplamKredi: number;
  abone: boolean;
  rozetAktif: boolean;
  profilFotoVar: boolean;
  teklifSayisi: number;
  harcananKredi: number;
};

type Sablon = { id: string; etiket: string; govde: string };

const UC: { id: KrediDagitimUcDurum; label: string }[] = [
  { id: "hepsi", label: "Hepsi" },
  { id: "evet", label: "Evet" },
  { id: "hayir", label: "Hayır" },
];

function UcSecim({
  label,
  value,
  onChange,
}: {
  label: string;
  value: KrediDagitimUcDurum;
  onChange: (v: KrediDagitimUcDurum) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-600 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1">
        {UC.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => onChange(u.id)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
              value === u.id
                ? "bg-amber-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {u.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SehirMultiSelect({
  sehirler,
  secili,
  onChange,
}: {
  sehirler: string[];
  secili: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [acik, setAcik] = useState(false);
  const [arama, setArama] = useState("");
  const kokRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!acik) return;
    function disariTik(e: MouseEvent) {
      if (!kokRef.current?.contains(e.target as Node)) {
        setAcik(false);
      }
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setAcik(false);
    }
    document.addEventListener("mousedown", disariTik);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", disariTik);
      document.removeEventListener("keydown", esc);
    };
  }, [acik]);

  const filtrelenmis = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    if (!q) return sehirler;
    return sehirler.filter((s) =>
      s.toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [sehirler, arama]);

  const ozet =
    secili.size === 0
      ? "Tüm şehirler"
      : secili.size <= 2
        ? [...secili].sort((a, b) => a.localeCompare(b, "tr")).join(", ")
        : `${secili.size} şehir seçili`;

  function toggle(s: string) {
    const n = new Set(secili);
    if (n.has(s)) n.delete(s);
    else n.add(s);
    onChange(n);
  }

  return (
    <div ref={kokRef} className="relative max-w-md">
      <p className="text-xs font-medium text-slate-600 mb-1.5">Şehir</p>
      <button
        type="button"
        aria-expanded={acik}
        aria-haspopup="listbox"
        onClick={() => setAcik((v) => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-800 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
      >
        <span className={secili.size === 0 ? "text-slate-500" : ""}>
          {ozet}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`size-5 shrink-0 text-slate-400 transition ${
            acik ? "rotate-180" : ""
          }`}
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {acik && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              type="search"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Şehir ara…"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              autoFocus
            />
          </div>
          <ul
            role="listbox"
            aria-multiselectable
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtrelenmis.length === 0 && (
              <li className="px-3 py-2 text-xs text-slate-400">Sonuç yok</li>
            )}
            {filtrelenmis.map((s) => {
              const checked = secili.has(s);
              return (
                <li key={s} role="option" aria-selected={checked}>
                  <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-slate-800 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(s)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span>{s}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-700 underline disabled:no-underline disabled:opacity-40"
                disabled={secili.size === 0}
                onClick={() => onChange(new Set())}
              >
                Temizle
              </button>
              <button
                type="button"
                className="text-xs font-medium text-slate-700 hover:text-slate-900 underline disabled:no-underline disabled:opacity-40"
                disabled={
                  filtrelenmis.length === 0 ||
                  filtrelenmis.every((s) => secili.has(s))
                }
                onClick={() => {
                  const n = new Set(secili);
                  for (const s of filtrelenmis) n.add(s);
                  onChange(n);
                }}
              >
                Tümü
              </button>
            </div>
            <button
              type="button"
              className="text-xs font-medium text-amber-700 hover:text-amber-800"
              onClick={() => setAcik(false)}
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PanelKrediDagitimPage() {
  const [sehirlerTum, setSehirlerTum] = useState<string[]>([]);
  const [sehirSecili, setSehirSecili] = useState<Set<string>>(new Set());
  const [abone, setAbone] = useState<KrediDagitimUcDurum>("hepsi");
  const [rozet, setRozet] = useState<KrediDagitimUcDurum>("hepsi");
  const [profilFoto, setProfilFoto] = useState<KrediDagitimUcDurum>("hepsi");
  const [teklifMin, setTeklifMin] = useState("");
  const [teklifMax, setTeklifMax] = useState("");
  const [harcananMin, setHarcananMin] = useState("");
  const [harcananMax, setHarcananMax] = useState("");

  const [satirlar, setSatirlar] = useState<Satir[]>([]);
  const [sablon, setSablon] = useState<Sablon | null>(null);
  const [secili, setSecili] = useState<Set<string>>(new Set());
  const [miktar, setMiktar] = useState("10");
  const [smsGonder, setSmsGonder] = useState(true);
  const [sablonGovde, setSablonGovde] = useState(KREDI_TANIM_SABLON_GOVDE);

  const [loading, setLoading] = useState(true);
  const [dagitiyor, setDagitiyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  const miktarSayi = Math.floor(Number(miktar)) || 0;
  const onizleme = useMemo(
    () => krediTanimSmsMesaji(miktarSayi || 0, sablonGovde),
    [miktarSayi, sablonGovde]
  );
  const smsDurum = useMemo(
    () => netgsmSmsMesajGecerliMi(onizleme),
    [onizleme]
  );

  const filtreQuery = useCallback(() => {
    const q = new URLSearchParams();
    for (const s of sehirSecili) q.append("sehir", s);
    if (abone !== "hepsi") q.set("abone", abone);
    if (rozet !== "hepsi") q.set("rozet", rozet);
    if (profilFoto !== "hepsi") q.set("profilFoto", profilFoto);
    if (teklifMin.trim()) q.set("teklifMin", teklifMin.trim());
    if (teklifMax.trim()) q.set("teklifMax", teklifMax.trim());
    if (harcananMin.trim()) q.set("harcananMin", harcananMin.trim());
    if (harcananMax.trim()) q.set("harcananMax", harcananMax.trim());
    return q.toString();
  }, [
    sehirSecili,
    abone,
    rozet,
    profilFoto,
    teklifMin,
    teklifMax,
    harcananMin,
    harcananMax,
  ]);

  const yukle = useCallback(async () => {
    setLoading(true);
    setHata("");
    try {
      const qs = filtreQuery();
      const r = await fetch(`/api/panel/kredi-dagitim${qs ? `?${qs}` : ""}`, {
        credentials: "include",
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "Yüklenemedi.");
      setSatirlar(d.satirlar ?? []);
      setSehirlerTum(d.sehirler ?? []);
      if (d.sablon?.govde) {
        setSablon(d.sablon);
        setSablonGovde((onceki) =>
          onceki === KREDI_TANIM_SABLON_GOVDE || !onceki.trim()
            ? d.sablon.govde
            : onceki
        );
      }
      setSecili(new Set());
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [filtreQuery]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  function toggle(id: string) {
    setSecili((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function hepsiniSec() {
    setSecili(new Set(satirlar.map((s) => s.id)));
  }

  async function dagit() {
    if (secili.size === 0) {
      setHata("En az bir kullanıcı seçin.");
      return;
    }
    if (miktarSayi < 1) {
      setHata("Kredi miktarı en az 1 olmalı.");
      return;
    }
    if (smsGonder && !smsDurum.gecerli) {
      setHata(smsDurum.hata ?? "SMS metni geçersiz.");
      return;
    }
    const onay = window.confirm(
      `${secili.size} kullanıcıya ${miktarSayi} kredi dağıtılacak` +
        (smsGonder ? " ve SMS gönderilecek" : "") +
        ". Onaylıyor musunuz?"
    );
    if (!onay) return;

    setDagitiyor(true);
    setHata("");
    setMesaj("");
    try {
      const r = await fetch("/api/panel/kredi-dagitim", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cekiciIds: [...secili],
          miktar: miktarSayi,
          smsGonder,
          sablonGovde,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "Dağıtım başarısız.");
      const smsBilgi = d.sms?.kuyrukId
        ? ` · SMS kuyruğa alındı (${d.sms.kuyrukId.slice(0, 8)}…)`
        : d.sms?.gonderilen != null
          ? ` · ${d.sms.gonderilen} SMS`
          : d.sms?.hata
            ? ` · SMS: ${d.sms.hata}`
            : "";
      setMesaj(`${d.dagitilan} kullanıcıya ${d.miktar} kredi tanımlandı${smsBilgi}`);
      await yukle();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Dağıtım başarısız.");
    } finally {
      setDagitiyor(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Toplu kredi dağıtım</h2>
          <p className="text-sm text-slate-500">
            Filtrele, seç, kalıcı kredi tanımla — isteğe bağlı toplu SMS
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/panel/sms/sablonlar"
            className="text-sm text-amber-700 font-medium self-center"
          >
            SMS şablonları
          </Link>
          <Btn type="button" variant="secondary" onClick={() => void yukle()}>
            Yenile
          </Btn>
        </div>
      </div>

      <Card className="space-y-4">
        <p className="text-sm font-semibold text-slate-700">Filtreler</p>
        <SehirMultiSelect
          sehirler={sehirlerTum}
          secili={sehirSecili}
          onChange={setSehirSecili}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <UcSecim label="Abone" value={abone} onChange={setAbone} />
          <UcSecim label="Rozetli" value={rozet} onChange={setRozet} />
          <UcSecim
            label="Profil fotoğrafı"
            value={profilFoto}
            onChange={setProfilFoto}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Teklif min"
            value={teklifMin}
            onChange={(e) => setTeklifMin(e.target.value)}
            inputMode="numeric"
            placeholder="0"
          />
          <Field
            label="Teklif max"
            value={teklifMax}
            onChange={(e) => setTeklifMax(e.target.value)}
            inputMode="numeric"
            placeholder="∞"
          />
          <Field
            label="Harcanan kredi min"
            value={harcananMin}
            onChange={(e) => setHarcananMin(e.target.value)}
            inputMode="numeric"
            placeholder="0"
          />
          <Field
            label="Harcanan kredi max"
            value={harcananMax}
            onChange={(e) => setHarcananMax(e.target.value)}
            inputMode="numeric"
            placeholder="∞"
          />
        </div>
        <p className="text-xs text-slate-400">
          Harcanan kredi: başarılı talep SMS sayısı × kullanıcının bildirim
          seviyesi (tahmini).
        </p>
      </Card>

      <Card className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">Dağıtım</p>
        <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
          <Field
            label="Kredi miktarı"
            value={miktar}
            onChange={(e) => setMiktar(e.target.value)}
            inputMode="numeric"
          />
          <div>
            <TextArea
              label={`SMS şablonu (${KREDI_TANIM_PH} = miktar)`}
              value={sablonGovde}
              onChange={(e) => setSablonGovde(e.target.value)}
              rows={2}
            />
            {sablon && (
              <p className="text-xs text-slate-400 mt-1">
                Kayıtlı şablon: {sablon.etiket}
              </p>
            )}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <p className="text-xs text-slate-500 mb-1">Önizleme</p>
          <p className="whitespace-pre-wrap">{onizleme}</p>
          <p className="text-xs text-slate-400 mt-1">
            {smsDurum.birim} birim · {smsDurum.parca} SMS
            {smsDurum.hata ? ` · ${smsDurum.hata}` : ""}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={smsGonder}
            onChange={(e) => setSmsGonder(e.target.checked)}
            className="rounded border-slate-300"
          />
          Dağıtımdan sonra toplu SMS gönder
        </label>
        <div className="flex flex-wrap gap-2">
          <Btn
            type="button"
            variant="secondary"
            onClick={hepsiniSec}
            disabled={satirlar.length === 0}
          >
            Listedekilerin tümünü seç ({satirlar.length})
          </Btn>
          <Btn
            type="button"
            onClick={() => void dagit()}
            disabled={dagitiyor || secili.size === 0}
          >
            {dagitiyor
              ? "Dağıtılıyor…"
              : `${secili.size} kişiye ${miktarSayi || "?"} kredi dağıt`}
          </Btn>
        </div>
      </Card>

      {mesaj && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          {mesaj}
        </p>
      )}
      {hata && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
          {hata}
        </p>
      )}

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && (
        <Card className="bg-slate-50">
          <p className="text-sm text-slate-600">
            Filtre sonucu <strong>{satirlar.length}</strong> kullanıcı ·{" "}
            <strong>{secili.size}</strong> seçili
          </p>
        </Card>
      )}

      {!loading && satirlar.length === 0 && (
        <Card>
          <p className="text-sm text-slate-600">Filtreye uyan kullanıcı yok.</p>
        </Card>
      )}

      {!loading && satirlar.length > 0 && (
        <div className="space-y-2">
          {satirlar.map((s) => (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              onClick={() => toggle(s.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle(s.id);
                }
              }}
            >
              <Card
                className={`cursor-pointer transition ${
                  secili.has(s.id) ? "border-amber-400 bg-amber-50/40" : ""
                }`}
              >
              <div className="flex gap-3 items-start">
                <input
                  type="checkbox"
                  checked={secili.has(s.id)}
                  onChange={() => toggle(s.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 rounded border-slate-300"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-semibold">{s.ad}</p>
                      <p className="text-sm text-slate-600">
                        {s.telefon} · {s.sehir}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {s.abone && (
                          <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full">
                            Abone
                          </span>
                        )}
                        {s.rozetAktif && (
                          <span className="text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full">
                            Rozet
                          </span>
                        )}
                        {s.profilFotoVar ? (
                          <span className="text-xs bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full">
                            Foto var
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            Foto yok
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-bold text-amber-700">
                        {s.toplamKredi} kredi
                      </p>
                      <p className="text-xs text-slate-500">
                        {s.teklifSayisi} teklif · {s.harcananKredi} harcanmış
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
