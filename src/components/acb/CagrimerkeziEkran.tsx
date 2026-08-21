"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { Btn } from "@/components/ui";
import { geocodeAdres, konumAlEsnek, reverseGeocode } from "@/lib/konum-client";
import { sesliOzetAlanlari, sesliOzetHazirMi } from "@/lib/fish-audio-ozet";
import { sesliMetindenGirdi } from "@/lib/fish-audio-diyalog";
import { SESLI_YARDIM_ILK_MESAJ } from "@/lib/fish-audio-prompt";
import {
  sesliAracParametreleri,
  sesliOzetBirlestir,
  sesliTalepDogrula,
  sesliTalepGovde,
  type SesliKonum,
  type SesliTalepGirdi,
} from "@/lib/fish-audio-talep";
import { parseJsonYanit } from "@/lib/api-json";
import {
  openaiRealtimeBaglan,
  type OpenAiRealtimeBaglanti,
} from "@/lib/openai-webrtc";
import {
  openaiRealtimeKullanimUsd,
  sesliMaliyetHeaderOku,
  sesliMaliyetYazi,
  type SesliSaglayiciDurum,
  type SesliSaglayiciId,
} from "@/lib/sesli-saglayici";
import { usdTryYazi } from "@/lib/usd-try";

type CagriDurum = "idle" | "connecting" | "connected" | "ended";
type AjanMod = "listening" | "thinking" | "speaking" | "";

type SohbetSatiri = {
  key: string;
  role: "user" | "agent";
  text: string;
  final: boolean;
};

type TalepSonuc = { id: string; bildirilenSayisi: number };

type TarayiciSR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: {
    results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
  }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

function tarayiciSRSinifi(): (new () => TarayiciSR) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => TarayiciSR;
    webkitSpeechRecognition?: new () => TarayiciSR;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function aracArgs(raw: unknown): Record<string, unknown> {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (raw && typeof raw === "object") return raw as Record<string, unknown>;
  return {};
}

export function CagrimerkeziEkran() {
  const [durum, setDurum] = useState<CagriDurum>("idle");
  const [mod, setMod] = useState<AjanMod>("");
  const [kayit, setKayit] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [hata, setHata] = useState("");
  const [sohbet, setSohbet] = useState<SohbetSatiri[]>([]);
  const [girdi, setGirdi] = useState<SesliTalepGirdi>({});
  const [konum, setKonum] = useState<SesliKonum | null>(null);
  const [talep, setTalep] = useState<TalepSonuc | null>(null);
  const [talepHata, setTalepHata] = useState("");
  const [talepYukleniyor, setTalepYukleniyor] = useState(false);
  const [testerOnly, setTesterOnly] = useState(true);
  const [yazi, setYazi] = useState("");
  const [saglayicilar, setSaglayicilar] = useState<SesliSaglayiciDurum[]>([]);
  const [saglayici, setSaglayici] = useState<SesliSaglayiciId>("openai");
  const [toplamMaliyet, setToplamMaliyet] = useState(0);
  const [usdTry, setUsdTry] = useState(0);
  const [usdTryKaynak, setUsdTryKaynak] = useState("");

  const girdiRef = useRef<SesliTalepGirdi>({});
  const konumRef = useRef<SesliKonum | null>(null);
  const talepRef = useRef<TalepSonuc | null>(null);
  const kilitRef = useRef(false);
  const sohbetRef = useRef<HTMLDivElement>(null);
  const srRef = useRef<TarayiciSR | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const siraRef = useRef(0);
  const dinlemeIptalRef = useRef(false);
  const openaiRef = useRef<OpenAiRealtimeBaglanti | null>(null);
  const aracCagriRef = useRef(new Set<string>());
  const saglayiciRef = useRef<SesliSaglayiciId>("openai");
  const yanitAktifRef = useRef(false);
  const yanitBekleRef = useRef(false);

  const secili = saglayicilar.find((s) => s.id === saglayici);
  const canliKonusma = secili?.canli === true;

  useEffect(() => {
    saglayiciRef.current = saglayici;
  }, [saglayici]);
  useEffect(() => {
    girdiRef.current = girdi;
  }, [girdi]);
  useEffect(() => {
    konumRef.current = konum;
  }, [konum]);
  useEffect(() => {
    talepRef.current = talep;
  }, [talep]);

  useEffect(() => {
    void fetch("/api/sesli-yardim/session")
      .then((r) =>
        parseJsonYanit<{
          testerOnly: boolean;
          saglayicilar: SesliSaglayiciDurum[];
          usdTry?: number;
          usdTryKaynak?: string;
        }>(r)
      )
      .then((d) => {
        setTesterOnly(d.testerOnly);
        setSaglayicilar(d.saglayicilar ?? []);
        if (typeof d.usdTry === "number" && d.usdTry > 0) setUsdTry(d.usdTry);
        if (d.usdTryKaynak) setUsdTryKaynak(d.usdTryKaynak);
        const tercih =
          (d.saglayicilar ?? []).find((s) => s.id === "openai" && s.aktif) ??
          (d.saglayicilar ?? []).find((s) => s.aktif);
        if (tercih) {
          setSaglayici(tercih.id);
          saglayiciRef.current = tercih.id;
        }
      })
      .catch(() => setSaglayicilar([]));
  }, []);

  useEffect(() => {
    sohbetRef.current?.scrollTo({ top: sohbetRef.current.scrollHeight, behavior: "smooth" });
  }, [sohbet]);

  const ozet = sesliOzetAlanlari(girdi, konum);
  const hazir = sesliOzetHazirMi(girdi, konum);

  const konumCoz = useCallback(async (adres?: string): Promise<SesliKonum | null> => {
    if (konumRef.current) return konumRef.current;
    const sozlu = adres?.trim();
    if (sozlu) {
      const geo = await geocodeAdres(sozlu);
      if (geo) {
        const k: SesliKonum = {
          lat: geo.lat,
          lng: geo.lng,
          adres: geo.adres,
          kaynak: "manuel",
        };
        konumRef.current = k;
        setKonum(k);
        return k;
      }
      const k: SesliKonum = { lat: 0, lng: 0, adres: sozlu, kaynak: "manuel" };
      konumRef.current = k;
      setKonum(k);
      return k;
    }
    return null;
  }, []);

  const gpsAl = useCallback(async () => {
    if (konumRef.current) return;
    try {
      const pos = await konumAlEsnek();
      const adres = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      const k: SesliKonum = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        adres,
        kaynak: "gps",
      };
      konumRef.current = k;
      setKonum(k);
      if (!girdiRef.current.adres) {
        const birlesik = sesliOzetBirlestir(girdiRef.current, { adres: k.adres });
        girdiRef.current = birlesik;
        setGirdi(birlesik);
      }
    } catch {
      /* konum sonradan konuşmadan alınır */
    }
  }, []);

  const talepOlustur = useCallback(async (): Promise<{
    ok: boolean;
    error?: string;
    id?: string;
    bildirilenSayisi?: number;
  }> => {
    if (talepRef.current) {
      return { ok: true, id: talepRef.current.id, bildirilenSayisi: talepRef.current.bildirilenSayisi };
    }
    const mevcut = girdiRef.current;
    let yer = konumRef.current;
    if (!yer && mevcut.adres) yer = await konumCoz(mevcut.adres);
    const dogrulama = sesliTalepDogrula(mevcut, yer);
    if (dogrulama || !yer) {
      return { ok: false, error: dogrulama || "Konum eksik." };
    }
    if (kilitRef.current) return { ok: false, error: "Talep zaten oluşturuluyor." };
    kilitRef.current = true;
    setTalepYukleniyor(true);
    setTalepHata("");
    try {
      const res = await fetch("/api/sesli-yardim/talep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sesliTalepGovde(mevcut, yer)),
      });
      const data = await parseJsonYanit<{ id?: string; bildirilenSayisi?: number; error?: string }>(res);
      if (!res.ok || !data.id) {
        kilitRef.current = false;
        const msg = data.error || "Talep oluşturulamadı.";
        setTalepHata(msg);
        return { ok: false, error: msg };
      }
      const sonuc = { id: data.id, bildirilenSayisi: data.bildirilenSayisi ?? 0 };
      talepRef.current = sonuc;
      setTalep(sonuc);
      return { ok: true, ...sonuc };
    } catch (e) {
      kilitRef.current = false;
      const msg = e instanceof Error ? e.message : "Talep oluşturulamadı.";
      setTalepHata(msg);
      return { ok: false, error: msg };
    } finally {
      setTalepYukleniyor(false);
    }
  }, [konumCoz]);

  useEffect(() => {
    if (!hazir || talep || talepYukleniyor) return;
    void talepOlustur();
  }, [hazir, talep, talepYukleniyor, talepOlustur]);

  const sohbetEkle = useCallback((role: SohbetSatiri["role"], text: string) => {
    siraRef.current += 1;
    const satir: SohbetSatiri = {
      key: `${role}-${siraRef.current}`,
      role,
      text,
      final: true,
    };
    setSohbet((onceki) => [...onceki, satir]);
    return satir.key;
  }, []);

  const ozetGuncelle = useCallback(
    (params: Record<string, unknown>) => {
      const gelen = sesliAracParametreleri(params);
      const birlesik = sesliOzetBirlestir(girdiRef.current, gelen);
      girdiRef.current = birlesik;
      setGirdi(birlesik);
      if (gelen.adres && !konumRef.current) void konumCoz(gelen.adres);
      return birlesik;
    },
    [konumCoz]
  );

  const musteriOzetIsle = useCallback(
    (metin: string) => {
      const gelen = sesliMetindenGirdi(metin, girdiRef.current);
      if (
        !gelen.sorunTipi &&
        !gelen.adres &&
        !gelen.lastikDurumu &&
        !gelen.yakitTipi &&
        !gelen.kilitDurumu &&
        !gelen.aracTipi &&
        !gelen.aracDurumu
      ) {
        return;
      }
      const birlesik = sesliOzetBirlestir(girdiRef.current, gelen);
      girdiRef.current = birlesik;
      setGirdi(birlesik);
      if (gelen.adres && !konumRef.current) void konumCoz(gelen.adres);
    },
    [konumCoz]
  );

  const yanitIste = useCallback((extra?: Record<string, unknown>) => {
    if (yanitAktifRef.current) {
      yanitBekleRef.current = true;
      return;
    }
    yanitAktifRef.current = true;
    openaiRef.current?.gonder({
      type: "response.create",
      ...(extra ? { response: extra } : {}),
    });
  }, []);

  const sesDurdur = useCallback(() => {
    dinlemeIptalRef.current = true;
    const sr = srRef.current;
    srRef.current = null;
    if (sr) {
      sr.onresult = null;
      sr.onerror = null;
      sr.onend = null;
      try {
        sr.abort();
      } catch {
        try {
          sr.stop();
        } catch {
          /* ignore */
        }
      }
    }
    setKayit(false);
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.src = "";
      audioRef.current = null;
    }
  }, []);

  const asistanKonus = useCallback(
    async (metin: string) => {
      sohbetEkle("agent", metin);
      setMod("speaking");
      try {
        const res = await fetch("/api/sesli-yardim/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: metin, saglayici: saglayiciRef.current }),
        });
        if (!res.ok) {
          const data = await parseJsonYanit<{ error?: string }>(res);
          throw new Error(data.error || "Ses üretilemedi.");
        }
        setToplamMaliyet((n) => n + sesliMaliyetHeaderOku(res.headers));
        const blob = await res.blob();
        sesDurdur();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(url);
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Ses oynatılamadı."));
          };
          void audio.play().catch(reject);
        });
      } finally {
        setMod("listening");
      }
    },
    [sesDurdur, sohbetEkle]
  );

  const musteriMetniIsle = useCallback(
    async (text: string) => {
      const ham = text.trim();
      if (!ham) {
        await asistanKonus("Sizi duyamadım, tekrar eder misiniz?");
        return;
      }
      sohbetEkle("user", ham);
      setMod("thinking");
      const res = await fetch("/api/sesli-yardim/tur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ham,
          girdi: girdiRef.current,
          konum: konumRef.current,
        }),
      });
      const data = await parseJsonYanit<{
        yanit?: string;
        girdi?: SesliTalepGirdi;
        error?: string;
        maliyetUsd?: number;
      }>(res);
      if (!res.ok || !data.yanit || !data.girdi) {
        throw new Error(data.error || "Yanıt alınamadı.");
      }
      if (data.maliyetUsd) setToplamMaliyet((n) => n + data.maliyetUsd!);
      girdiRef.current = data.girdi;
      setGirdi(data.girdi);
      if (data.girdi.adres && !konumRef.current) {
        void konumCoz(data.girdi.adres);
      }
      await asistanKonus(data.yanit);
    },
    [asistanKonus, konumCoz, sohbetEkle]
  );

  const openaiAracCalistir = useCallback(
    async (name: string, args: Record<string, unknown>) => {
      if (name === "get_current_location") {
        if (konumRef.current) return { ok: true, ...konumRef.current };
        try {
          const pos = await konumAlEsnek();
          const adres = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          const k: SesliKonum = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            adres,
            kaynak: "gps",
          };
          konumRef.current = k;
          setKonum(k);
          if (!girdiRef.current.adres) {
            const birlesik = sesliOzetBirlestir(girdiRef.current, { adres: k.adres });
            girdiRef.current = birlesik;
            setGirdi(birlesik);
          }
          return { ok: true, ...k };
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : "Konum alınamadı." };
        }
      }
      if (name === "guncelle_talep_ozet") {
        ozetGuncelle(args);
        return { ok: true };
      }
      if (name === "create_acil_talep") {
        ozetGuncelle(args);
        return talepOlustur();
      }
      return { ok: false, error: "Bilinmeyen araç." };
    },
    [ozetGuncelle, talepOlustur]
  );

  const openaiOlay = useCallback(
    (ev: Record<string, unknown>) => {
      const type = String(ev.type ?? "");
      if (type === "error") {
        const err = ev.error as { message?: string } | undefined;
        const msg = err?.message ?? "";
        if (/active response in progress/i.test(msg)) {
          yanitAktifRef.current = true;
          yanitBekleRef.current = true;
          return;
        }
        if (msg) setHata(msg);
        return;
      }
      if (type === "response.created") {
        yanitAktifRef.current = true;
      }
      if (type === "response.output_audio.delta" || type === "response.audio.delta") {
        setMod("speaking");
      }
      if (type === "output_audio_buffer.stopped") {
        setMod("listening");
      }
      if (type === "response.done") {
        setMod("listening");
        yanitAktifRef.current = false;
        const resp = ev.response as { usage?: Parameters<typeof openaiRealtimeKullanimUsd>[0] } | undefined;
        const usage = resp?.usage;
        if (usage) setToplamMaliyet((n) => n + openaiRealtimeKullanimUsd(usage));
        if (yanitBekleRef.current) {
          yanitBekleRef.current = false;
          yanitIste();
        }
      }
      if (
        type === "conversation.item.input_audio_transcription.completed" &&
        typeof ev.transcript === "string" &&
        ev.transcript.trim()
      ) {
        const metin = ev.transcript.trim();
        siraRef.current += 1;
        const key = `user-${siraRef.current}`;
        setSohbet((onceki) => {
          const son = onceki[onceki.length - 1];
          if (son?.role === "user" && son.text === metin) return onceki;
          return [...onceki, { key, role: "user", text: metin, final: true }];
        });
        musteriOzetIsle(metin);
      }
      if (
        type !== "response.output_audio_transcript.delta" &&
        type !== "response.audio_transcript.delta" &&
        type !== "response.output_audio_transcript.done" &&
        type !== "response.audio_transcript.done"
      ) {
        /* araç çağrıları aşağıda */
      } else {
        const itemId = typeof ev.item_id === "string" ? ev.item_id : "";
        if (itemId) {
          const delta = typeof ev.delta === "string" ? ev.delta : "";
          const full = typeof ev.transcript === "string" ? ev.transcript : "";
          const bitis = type.endsWith(".done");
          const parca = bitis ? full : delta;
          if (parca && !/^(get_current_location|guncelle_talep_ozet|create_acil_talep)$/i.test(parca.trim())) {
            setSohbet((onceki) => {
              const i = onceki.findIndex((x) => x.key === itemId);
              if (i < 0) {
                return [
                  ...onceki,
                  { key: itemId, role: "agent", text: parca, final: bitis },
                ];
              }
              const kopya = onceki.slice();
              kopya[i] = {
                ...kopya[i],
                text: bitis ? parca : kopya[i].text + parca,
                final: bitis,
              };
              return kopya;
            });
          }
        }
      }

      const fnName = typeof ev.name === "string" ? ev.name : "";
      const callId = typeof ev.call_id === "string" ? ev.call_id : "";
      const item = ev.item as
        | { type?: string; name?: string; call_id?: string; arguments?: unknown }
        | undefined;
      const fn =
        type === "response.function_call_arguments.done"
          ? { name: fnName, call_id: callId, arguments: ev.arguments }
          : item?.type === "function_call"
            ? item
            : null;
      if (fn?.name && fn.call_id) {
        if (aracCagriRef.current.has(fn.call_id)) return;
        aracCagriRef.current.add(fn.call_id);
        void openaiAracCalistir(fn.name, aracArgs(fn.arguments)).then((out) => {
          openaiRef.current?.gonder({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: fn.call_id,
              output: JSON.stringify(out),
            },
          });
          yanitIste();
        });
      }
    },
    [musteriOzetIsle, openaiAracCalistir, yanitIste]
  );

  const kayitBaslat = useCallback(() => {
    const SR = tarayiciSRSinifi();
    if (!SR) {
      setHata("Bu tarayıcı ücretsiz ses tanımayı desteklemiyor. Chrome veya Safari kullanın, ya da yazın.");
      return;
    }
    sesDurdur();
    dinlemeIptalRef.current = false;
    const sr = new SR();
    sr.lang = "tr-TR";
    sr.continuous = false;
    sr.interimResults = true;
    sr.onresult = (ev) => {
      const last = ev.results[ev.results.length - 1];
      if (!last?.isFinal) return;
      const metin = last[0]?.transcript?.trim() ?? "";
      sesDurdur();
      void musteriMetniIsle(metin).catch((e) => {
        setHata(e instanceof Error ? e.message : "Yanıt alınamadı.");
        setMod("listening");
      });
    };
    sr.onerror = (ev) => {
      if (dinlemeIptalRef.current) return;
      sesDurdur();
      if (ev.error === "not-allowed") setHata("Mikrofon izni gerekli.");
      else if (ev.error !== "aborted" && ev.error !== "no-speech") {
        setHata("Ses tanınamadı. Yazarak da yanıtlayabilirsiniz.");
      }
      setMod("listening");
    };
    sr.onend = () => {
      if (srRef.current === sr) {
        srRef.current = null;
        setKayit(false);
      }
    };
    srRef.current = sr;
    sr.start();
    setKayit(true);
    setMod("listening");
  }, [musteriMetniIsle, sesDurdur]);

  const cagriBitir = useCallback(() => {
    sesDurdur();
    openaiRef.current?.kapat();
    openaiRef.current = null;
    setMicMuted(false);
    setDurum("ended");
    setMod("");
  }, [sesDurdur]);

  async function cagriBaslat() {
    if (!secili?.aktif) {
      setHata(`${secili?.ad ?? "Sağlayıcı"} için API anahtarı yok.`);
      return;
    }
    setHata("");
    setDurum("connecting");
    setSohbet([]);
    setGirdi({});
    girdiRef.current = {};
    setKonum(null);
    konumRef.current = null;
    setTalep(null);
    talepRef.current = null;
    kilitRef.current = false;
    setTalepHata("");
    siraRef.current = 0;
    setToplamMaliyet(0);
    aracCagriRef.current = new Set();
    yanitAktifRef.current = false;
    yanitBekleRef.current = false;
    try {
      void gpsAl();
      if (secili.canli) {
        const res = await fetch("/api/sesli-yardim/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ saglayici: secili.id }),
        });
        const data = await parseJsonYanit<{
          tur?: string;
          clientSecret?: string;
          error?: string;
        }>(res);
        if (!res.ok || !data.clientSecret) {
          throw new Error(data.error || "Oturum açılamadı.");
        }
        const bag = await openaiRealtimeBaglan({
          clientSecret: data.clientSecret,
          onEvent: openaiOlay,
        });
        openaiRef.current = bag;
        setDurum("connected");
        setMod("speaking");
        yanitIste({
          instructions: `Sadece şu cümleyi söyle. Araç çağırma, başka cümle ekleme: ${SESLI_YARDIM_ILK_MESAJ}`,
        });
        return;
      }
      await navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
        s.getTracks().forEach((t) => t.stop());
      });
      setDurum("connected");
      await asistanKonus(SESLI_YARDIM_ILK_MESAJ);
    } catch (e) {
      openaiRef.current?.kapat();
      openaiRef.current = null;
      const msg =
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Mikrofon izni gerekli."
          : e instanceof Error
            ? e.message
            : "Çağrı başlatılamadı.";
      setHata(msg);
      setDurum("idle");
    }
  }

  async function yaziGonder() {
    const text = yazi.trim();
    if (!text || durum !== "connected" || kayit) return;
    setYazi("");
    if (openaiRef.current) {
      sohbetEkle("user", text);
      musteriOzetIsle(text);
      openaiRef.current.gonder({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [{ type: "input_text", text }],
        },
      });
      yanitIste();
      return;
    }
    try {
      await musteriMetniIsle(text);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yanıt alınamadı.");
      setMod("listening");
    }
  }

  function micTikla() {
    if (openaiRef.current) {
      const next = !micMuted;
      openaiRef.current.setMicMuted(next);
      setMicMuted(next);
      return;
    }
    try {
      setHata("");
      if (kayit) sesDurdur();
      else kayitBaslat();
    } catch (e) {
      setKayit(false);
      setHata(e instanceof Error ? e.message : "Kayıt başarısız.");
      setMod("listening");
    }
  }

  const bagli = durum === "connected";
  const baglaniyor = durum === "connecting";
  const modEtiket =
    durum === "connecting"
      ? "Bağlanıyor…"
      : canliKonusma && bagli
        ? micMuted
          ? "Mikrofon kapalı"
          : "Canlı konuşma"
        : kayit
          ? "Konuşun — bitince mikrofona basın"
          : mod === "speaking"
            ? "Asistan konuşuyor"
            : mod === "thinking"
              ? "Anlıyor…"
              : bagli
                ? "Dinlemeye hazır"
                : "Hazır";

  const zorunlu = ozet.filter((a) => a.zorunlu);
  const zorunluTamam = zorunlu.filter((a) => a.tamam).length;
  const anahtarEksik = Boolean(secili) && !secili?.aktif;

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[var(--acb-soft)] text-[var(--acb-dark)]">
      <header className="z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--acb-border)] bg-white px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--acb-muted)]">
            Test · /cagrimerkezi
          </p>
          <h1 className="text-lg font-bold tracking-tight">Çağrı merkezi</h1>
          <p className="text-xs text-[var(--acb-muted)]">
            {secili ? `${secili.ad} · ${secili.model}` : "Sağlayıcı seçin"}
            {usdTry > 0 ? ` · 1$ = ₺${usdTryYazi(usdTry)}` : ""}
            {testerOnly ? " · bildirimler yalnızca tester hesaplara" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <label className="sr-only" htmlFor="ses-saglayici">
            Ses sağlayıcı
          </label>
          <select
            id="ses-saglayici"
            value={saglayici}
            disabled={bagli || baglaniyor}
            onChange={(e) => setSaglayici(e.target.value as SesliSaglayiciId)}
            className="min-h-11 rounded-xl border border-[var(--acb-border)] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--acb-green)] disabled:opacity-60"
          >
            {(saglayicilar.length ? saglayicilar : [
              { id: "openai" as const, ad: "ChatGPT", aktif: false },
              { id: "fish" as const, ad: "Fish Audio", aktif: false },
              { id: "elevenlabs" as const, ad: "ElevenLabs", aktif: false },
            ]).map((s) => (
              <option key={s.id} value={s.id} disabled={"aktif" in s && !s.aktif}>
                {s.ad}
                {"aktif" in s && !s.aktif ? " (anahtar yok)" : ""}
              </option>
            ))}
          </select>
          <span
            className="min-w-[6.5rem] rounded-xl border border-[var(--acb-border)] bg-white px-3 py-2 text-right text-sm font-semibold tabular-nums"
            title={
              usdTry > 0
                ? `1 USD = ₺${usdTryYazi(usdTry)}${usdTryKaynak ? ` (${usdTryKaynak})` : ""}`
                : "Kur yükleniyor"
            }
          >
            {sesliMaliyetYazi(toplamMaliyet, usdTry)}
          </span>
          <span className="hidden text-sm text-[var(--acb-muted)] sm:inline">{modEtiket}</span>
          {bagli ? (
            <>
              <button
                type="button"
                onClick={micTikla}
                disabled={!canliKonusma && (mod === "speaking" || mod === "thinking")}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border active:scale-95 ${
                  kayit || (canliKonusma && !micMuted)
                    ? "border-red-300 bg-red-600 text-white"
                    : "border-[var(--acb-border)] bg-white"
                }`}
                aria-label={canliKonusma ? (micMuted ? "Sesi aç" : "Sustur") : kayit ? "Kaydı bitir" : "Konuş"}
              >
                {canliKonusma ? (
                  micMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />
                ) : kayit ? (
                  <MicOff className="size-5" />
                ) : (
                  <Mic className="size-5" />
                )}
              </button>
              <Btn variant="danger" className="!w-auto !min-h-11 !px-4" onClick={cagriBitir}>
                <PhoneOff className="mr-2 inline size-4" />
                Kapat
              </Btn>
            </>
          ) : (
            <Btn
              variant="primary"
              className="!w-auto !min-h-11 !px-5"
              onClick={() => void cagriBaslat()}
              disabled={anahtarEksik || baglaniyor}
            >
              <Phone className="mr-2 inline size-4" />
              {baglaniyor ? "Bağlanıyor…" : "Ara"}
            </Btn>
          )}
        </div>
      </header>

      {anahtarEksik ? (
        <p className="mx-4 mt-3 shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {saglayici === "openai" ? (
            <>
              <code className="font-mono">OPENAI_API_KEY</code> ekleyin. ChatGPT{" "}
              <strong>gpt-realtime-2.1</strong> ile canlı konuşur.
            </>
          ) : saglayici === "elevenlabs" ? (
            <>
              <code className="font-mono">ELEVENLABS_API_KEY</code> ekleyin (
              <a className="underline" href="https://elevenlabs.io/app/settings/api-keys" target="_blank" rel="noreferrer">
                elevenlabs.io
              </a>
              ).
            </>
          ) : (
            <>
              <code className="font-mono">FISH_AUDIO_API_KEY</code> ekleyin (
              <a className="underline" href="https://fish.audio/app/api-keys" target="_blank" rel="noreferrer">
                fish.audio
              </a>
              ).
            </>
          )}
        </p>
      ) : null}
      {hata ? (
        <p className="mx-4 mt-3 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {hata}
        </p>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <section className="flex min-h-0 min-w-0 flex-col border-[var(--acb-border)] bg-white lg:border-r">
          <div className="shrink-0 border-b border-[var(--acb-border)] px-4 py-2 text-sm font-semibold">
            Konuşma
          </div>
          <div ref={sohbetRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-24">
            {sohbet.length === 0 ? (
              <p className="text-sm text-[var(--acb-muted)]">
                {canliKonusma
                  ? "Ara’ya basın. ChatGPT canlı dinler ve konuşur; mikrofona basmanıza gerek yok."
                  : "Ara’ya basın. Asistan konuşur; yanıt için mikrofona basın veya yazın."}
              </p>
            ) : (
              sohbet.map((s) => (
                <div
                  key={s.key}
                  className={`flex ${s.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      s.role === "user"
                        ? "bg-[var(--acb-green)] text-white"
                        : "bg-[var(--acb-soft)] text-[var(--acb-dark)]"
                    } ${s.final ? "" : "opacity-70"}`}
                  >
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                      {s.role === "user" ? "Müşteri" : "Asistan"}
                    </p>
                    {s.text}
                  </div>
                </div>
              ))
            )}
          </div>
          <form
            className="flex shrink-0 gap-2 border-t border-[var(--acb-border)] bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            onSubmit={(e) => {
              e.preventDefault();
              void yaziGonder();
            }}
          >
            <input
              value={yazi}
              onChange={(e) => setYazi(e.target.value)}
              disabled={!bagli || kayit}
              placeholder={bagli ? "Yazarak da yanıtla…" : "Önce ara’ya basın"}
              className="min-h-11 flex-1 rounded-xl border border-[var(--acb-border)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--acb-green)]"
            />
            <Btn type="submit" variant="secondary" className="!w-auto !min-h-11 !px-4" disabled={!bagli || kayit}>
              Gönder
            </Btn>
          </form>
        </section>

        <aside className="min-h-0 overflow-y-auto bg-[var(--acb-soft)]/50 p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold">Toplanan bilgiler</h2>
            <span className="text-xs text-[var(--acb-muted)]">
              {zorunluTamam}/{zorunlu.length || 0} zorunlu
            </span>
          </div>
          <ul className="space-y-2">
            {ozet.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-[var(--acb-border)] bg-white px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--acb-muted)]">
                    {a.label}
                    {a.zorunlu ? "" : " · opsiyonel"}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      a.tamam ? "text-[var(--acb-green)]" : a.zorunlu ? "text-amber-600" : "text-slate-400"
                    }`}
                  >
                    {a.tamam ? "Tamam" : a.zorunlu ? "Eksik" : "—"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm">{a.deger || "—"}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-xl border border-[var(--acb-border)] bg-white px-3 py-3 text-sm">
            {talep ? (
              <p>
                Talep oluşturuldu. Tester çekicilere iletildi
                {talep.bildirilenSayisi ? ` (${talep.bildirilenSayisi})` : ""}.
                <a className="ml-1 font-semibold text-[var(--acb-green)] underline" href={`/bekle/${talep.id}`}>
                  Teklifleri gör
                </a>
              </p>
            ) : talepYukleniyor ? (
              <p>Bilgiler tamam — talep arka planda oluşturuluyor…</p>
            ) : hazir ? (
              <p>Zorunlu alanlar doldu. Talep oluşturulacak.</p>
            ) : (
              <p className="text-[var(--acb-muted)]">
                Konuştukça bu özet dolar. Hepsi tamamlanınca talep yalnızca tester hesaplara gider.
              </p>
            )}
            {talepHata ? <p className="mt-2 text-red-700">{talepHata}</p> : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
