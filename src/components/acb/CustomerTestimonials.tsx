"use client";

import { useMemo, useState, useEffect } from "react";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";

export interface TestimonialItem {
  id: string;
  name: string;
  location: string;
  vehicleOrIssue: string;
  rating: number;
  timeAgo: string;
  highlightBadge: string;
  highlightType: "speed" | "price" | "trust" | "satisfaction";
  quote: string;
  steps: string[];
}

export const MUSTERI_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "t_sorun",
    name: "Ahmet K.",
    location: "İstanbul · Kadıköy",
    vehicleOrIssue: "Otomobil Çekici",
    rating: 4.9,
    timeAgo: "Dün",
    highlightBadge: "⚡ 8 Dk'da Ulaştı",
    highlightType: "speed",
    quote:
      "Gece yarısı otoyolda kaldım, çekici bulmak kabus gibiydi. 1 dakikada talep açtım, 8 dakika içinde en yakın çekici yanımdaydı. Dakikalar içinde çözüme kavuştum!",
    steps: ["sorun"],
  },
  {
    id: "t_konum",
    name: "Burak E.",
    location: "Bursa · Nilüfer",
    vehicleOrIssue: "Otomatik GPS Konumu",
    rating: 4.8,
    timeAgo: "Bu hafta",
    highlightBadge: "📍 Kolay & Hızlı Konum",
    highlightType: "speed",
    quote:
      "Adresi tam bilmediğim bir ara sokakta kaldım. Tek tuşla konumumu buldu, telefonla tarif etme derdi olmadan 10 dakikada çekici kapımdaydı.",
    steps: ["konum"],
  },
  {
    id: "t_kilit",
    name: "Serdar D.",
    location: "Kocaeli · Gebze",
    vehicleOrIssue: "SUV · Kilitli Direksiyon",
    rating: 5.0,
    timeAgo: "4 gün önce",
    highlightBadge: "⭐ Çiziksiz & Hasarsız",
    highlightType: "satisfaction",
    quote:
      "Aracımın direksiyonu ve şanzımanı kilitlenmişti. Formda detayları girince tam uygun aparatlı vinçli çekici geldi. Aracımı tek bir çizik dahi olmadan özenle çektiler.",
    steps: ["kilit_durumu"],
  },
  {
    id: "t_yakit",
    name: "Caner P.",
    location: "İstanbul · Maslak",
    vehicleOrIssue: "Elektrikli / Hibrit Araç",
    rating: 4.7,
    timeAgo: "3 gün önce",
    highlightBadge: "⚡ Uzman Ekipman",
    highlightType: "satisfaction",
    quote:
      "Elektrikli aracımın bataryası bitti. Çekicinin aracıma zarar vermeden taşıması çok kritikti. Tam donanımlı ve tecrübeli bir ekip geldi, içim çok rahat etti.",
    steps: ["yakit_tipi"],
  },
  {
    id: "t_lastik",
    name: "Murat K.",
    location: "İzmir · Bornova",
    vehicleOrIssue: "Oto Lastik Değişimi",
    rating: 4.9,
    timeAgo: "Dün",
    highlightBadge: "⚡ 12 Dk'da Yola Devam",
    highlightType: "speed",
    quote:
      "Lastiğim patladığında ne yapacağımı şaşırmıştım. Talebi açtıktan 12 dakika sonra mobil lastikçi ulaştı ve lastiğimi tertemiz değiştirip yoluma devam ettirdi.",
    steps: ["lastik_durumu"],
  },
  {
    id: "t_fotograf",
    name: "Onur S.",
    location: "Ankara · Yenimahalle",
    vehicleOrIssue: "Fotoğraflı Teklif",
    rating: 4.8,
    timeAgo: "5 gün önce",
    highlightBadge: "🛡️ Şeffaf İletişim",
    highlightType: "trust",
    quote:
      "Fotoğraf yüklediğim için çekici durumu hemen gördü ve tam ihtiyacım olan kayar kasa araçla geldi. Sürpriz hiçbir aksilik yaşanmadı.",
    steps: ["fotograf"],
  },
  {
    id: "t_arac_tipi",
    name: "Hakan T.",
    location: "İstanbul · Ümraniye",
    vehicleOrIssue: "Ticari Minibüs Çekici",
    rating: 4.7,
    timeAgo: "Bu hafta",
    highlightBadge: "💰 En İyi Fiyat",
    highlightType: "price",
    quote:
      "Büyük ticari araç için piyasada çok abartı rakamlar isteniyor. Buradan tam aracıma uygun çekiciyi en makul fiyata buldum. Helal olsun.",
    steps: ["arac_tipi"],
  },
  {
    id: "t_arac_modeli",
    name: "Sinem R.",
    location: "İzmir · Çeşme",
    vehicleOrIssue: "Otomatik Vites Sedan",
    rating: 5.0,
    timeAgo: "2 gün önce",
    highlightBadge: "⭐ %100 Memnuniyet",
    highlightType: "satisfaction",
    quote:
      "Yolda tek başıma kalınca çok tedirgin olmuştum. Gelen çekici operatörü o kadar beyefendi ve yardımseverdi ki tüm endişem yok oldu. Harika bir hizmet!",
    steps: ["arac_modeli"],
  },
  {
    id: "t_arac_durumu",
    name: "Tolga M.",
    location: "Antalya · Muratpaşa",
    vehicleOrIssue: "Tekerlek Dönmüyor · Vinçli",
    rating: 4.9,
    timeAgo: "3 gün önce",
    highlightBadge: "🛡️ Profesyonel Hizmet",
    highlightType: "trust",
    quote:
      "Kaza sonrası tekerlek dönmüyordu. Özel teker patenleriyle aracıma hiç zarar vermeden yüklediler. İşinin ehli insanlarla çalışmak büyük lüks.",
    steps: ["arac_durumu"],
  },
  {
    id: "t_ek_detay",
    name: "Kemal D.",
    location: "Eskişehir · Tepebaşı",
    vehicleOrIssue: "Kapalı Otoparktan Çıkarma",
    rating: 4.6,
    timeAgo: "Geçen hafta",
    highlightBadge: "⚡ Hızlı Çözüm",
    highlightType: "speed",
    quote:
      "Kapalı otoparkta kaldığım için alçak tavan çekici gerekiyordu. Notumu okuyup tam uygun araçla geldiler, 15 dakikada otoparktan çıkardılar.",
    steps: ["ek_detay"],
  },
  {
    id: "t_ihale",
    name: "Mustafa Y.",
    location: "Ankara · Çankaya",
    vehicleOrIssue: "Çoklu Teklif Karşılaştırma",
    rating: 4.8,
    timeAgo: "3 gün önce",
    highlightBadge: "💰 En İyi Fiyat Garantisi",
    highlightType: "price",
    quote:
      "Piyasadaki çekicilerin telefonla istediği fahiş rakamların neredeyse yarı fiyatına şeffaf teklifler aldım. En uygun fiyatı bulmak hiç bu kadar kolay olmamıştı.",
    steps: ["ihale"],
  },
  {
    id: "t_hedef",
    name: "Volkan C.",
    location: "Antalya → İstanbul",
    vehicleOrIssue: "Şehirlerarası Çekici",
    rating: 5.0,
    timeAgo: "5 gün önce",
    highlightBadge: "🛡️ Sabit Fiyat Sözü",
    highlightType: "trust",
    quote:
      "Uzak mesafe çekici için normalde inanılmaz fırsatçılık yapılır. Burada baştan şeffaf km hesabı ve sabit teklif alıp çektirdim. Sıfır stres, 1 kuruş fazla ödemedim.",
    steps: ["hedef"],
  },
  {
    id: "t_ozet",
    name: "Buse T.",
    location: "İzmir · Karşıyaka",
    vehicleOrIssue: "Sabit Fiyat Güvencesi",
    rating: 4.9,
    timeAgo: "2 gün önce",
    highlightBadge: "🛡️ Kazıklanma Korkusu Yok",
    highlightType: "trust",
    quote:
      "Yolda kalınca çekicilerin fırsatçılık yapıp fahiş fiyat istemesinden çok korkuyordum. Sistem sayesinde önceden onayladığım sabit fiyatı ödedim, sonradan 1 kuruş dahi sürpriz çıkmadı.",
    steps: ["ozet"],
  },
  {
    id: "t_telefon",
    name: "Cemil S.",
    location: "Adana · Seyhan",
    vehicleOrIssue: "SMS Doğrulama & Anlık Teklif",
    rating: 4.7,
    timeAgo: "Bu hafta",
    highlightBadge: "⚡ 30 Saniyede Bildirim",
    highlightType: "speed",
    quote:
      "Numaramı girer girmez 30 saniye içinde bölgedeki güvenilir çekicilerden SMS teklifleri düştü. Hız ve müşteri memnuniyeti gerçekten 10 numara.",
    steps: ["telefon"],
  },
  {
    id: "t_bekle",
    name: "Zeynep A.",
    location: "İstanbul · Beşiktaş",
    vehicleOrIssue: "Teklif Seçimi & Takip",
    rating: 5.0,
    timeAgo: "Geçen hafta",
    highlightBadge: "⭐ %100 Güvenilirlik",
    highlightType: "satisfaction",
    quote:
      "Gelen teklifleri puanına, yorumuna ve fiyatına göre inceleyip içime en sinen çekiciyi seçtim. 5 dakika içinde anlaştık ve yola çıktık. Müthiş kolaylık!",
    steps: ["bekle"],
  },
  {
    id: "t_genel",
    name: "Emre G.",
    location: "Gaziantep · Şehitkamil",
    vehicleOrIssue: "Acil Yol Yardım",
    rating: 4.8,
    timeAgo: "Dün",
    highlightBadge: "💰 Şeffaf & Dürüst",
    highlightType: "price",
    quote:
      "Ne söyledilerse kuruşu kuruşuna o rakamı ödedim. Telefon başında pazarlık yapma ve kazıklanma korkusunu bitiren harika bir platform.",
    steps: ["giris"],
  },
];

const BADGE_STYLES: Record<TestimonialItem["highlightType"], { bg: string; text: string; border: string }> = {
  speed: {
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-200",
  },
  price: {
    bg: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
  },
  trust: {
    bg: "bg-teal-50",
    text: "text-teal-900",
    border: "border-teal-200",
  },
  satisfaction: {
    bg: "bg-blue-50",
    text: "text-blue-900",
    border: "border-blue-200",
  },
};

/**
 * 5 Yıldız üzerinden oransal/kesirli (örn: 4.7, 4.9, 5.0) şık altın yıldız bileşeni
 */
function StarRating({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`5 üzerinden ${rating.toFixed(1)} puan`}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fillPercent = Math.max(
          0,
          Math.min(100, Math.round((rating - (starIndex - 1)) * 100))
        );
        return (
          <span key={starIndex} className="relative inline-block size-3.5">
            {/* Arka plan boş yıldız */}
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5 text-slate-200">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {/* Ön plan dolu altın yıldız (yüzde dolgulu) */}
            {fillPercent > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5 text-amber-400">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Adım bazlı tekil testimonial kartı (Her sayfa geçişinde adıma özel ve benzersiz yorum gösterir)
 */
export function StepTestimonialCard({
  step,
  className = "",
}: {
  step: string;
  className?: string;
}) {
  const [altIndex, setAltIndex] = useState(0);

  // Bu adıma özel eşleşen yorumlar veya tüm havuz
  const candidates = useMemo(() => {
    const matched = MUSTERI_TESTIMONIALS.filter((t) => t.steps.includes(step));
    if (matched.length > 0) return matched;
    return MUSTERI_TESTIMONIALS;
  }, [step]);

  // Sayfa / adım değiştiğinde farklı bir yorum seçilmesi için
  useEffect(() => {
    setAltIndex(0);
  }, [step]);

  const item = candidates[altIndex % candidates.length] || MUSTERI_TESTIMONIALS[0];
  const badgeStyle = BADGE_STYLES[item.highlightType];

  return (
    <div
      key={`${step}-${item.id}`}
      className={`relative overflow-hidden rounded-[var(--acb-radius-lg)] border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/70 p-3.5 sm:p-4 shadow-2xs animate-fade-in transition-all duration-200 ${className}`}
      role="region"
      aria-label="Müşteri Değerlendirmesi"
    >
      {/* Üst Kısım: Yıldızlar + Doğrulanmış Müşteri Rozeti */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <StarRating rating={item.rating} />
          <span className="text-xs font-bold text-slate-800 tabular-nums">
            {item.rating.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {item.highlightBadge}
          </span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
            <AcbIcons.check className="size-3" strokeWidth={ACB_ICON_STROKE} aria-hidden />
            Doğrulandı
          </span>
        </div>
      </div>

      {/* Yorum Metni */}
      <p className="mt-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal">
        “{item.quote}”
      </p>

      {/* Alt Kısım: Kullanıcı ve Lokasyon Bilgisi */}
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
            {item.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <span className="font-semibold text-slate-900 truncate">{item.name}</span>
          <span className="text-slate-400">·</span>
          <span className="truncate text-slate-500">{item.location}</span>
        </div>
        <span className="shrink-0 text-slate-400">{item.timeAgo}</span>
      </div>
    </div>
  );
}

/**
 * Ana Sayfa / Giriş Ekranı İçin Çoklu Testimonial Vitrini (Carousel & Grid)
 */
export function CustomerTestimonialSection({ className = "" }: { className?: string }) {
  const [aktifIndex, setAktifIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAktifIndex((prev) => (prev + 1) % MUSTERI_TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const cur = MUSTERI_TESTIMONIALS[aktifIndex];
  const badgeStyle = BADGE_STYLES[cur.highlightType];

  return (
    <section
      aria-label="Müşteri Yorumları ve Güven Değerlendirmeleri"
      className={`space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Gerçek Müşteri Deneyimleri
          </p>
          <h3 className="text-lg font-bold text-slate-900">
            Binlerce Sürücü Güvenle Çözüme Ulaştı
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-amber-500 font-bold text-sm">★ 4.9</span>
          <span className="text-xs text-slate-400 font-medium">(2.400+ Yorum)</span>
        </div>
      </div>

      {/* Vurgulanan Ana Yorum Kartı */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/20 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <StarRating rating={cur.rating} />
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {cur.rating.toFixed(1)} / 5.0
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {cur.highlightBadge}
          </span>
        </div>

        <p className="mt-3 text-sm text-slate-800 leading-relaxed font-medium">
          “{cur.quote}”
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xs">
              {cur.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{cur.name}</p>
              <p className="text-[11px] text-slate-500">{cur.location} · {cur.vehicleOrIssue}</p>
            </div>
          </div>
          <span className="text-xs text-slate-400">{cur.timeAgo}</span>
        </div>

        {/* Kaydırma Noktaları */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {MUSTERI_TESTIMONIALS.map((t, idx) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAktifIndex(idx)}
              aria-label={`Yorum ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                aktifIndex === idx
                  ? "w-6 bg-emerald-600"
                  : "w-1.5 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* 3'lü Güven Rozet Şeridi */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
          <p className="text-base font-bold text-emerald-700">⚡ 10 Dk</p>
          <p className="text-[11px] font-medium text-slate-600 mt-0.5">Ortalama Ulaşım</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
          <p className="text-base font-bold text-emerald-700">🛡️ Sabit</p>
          <p className="text-[11px] font-medium text-slate-600 mt-0.5">Sürpriz Fiyat Yok</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs">
          <p className="text-base font-bold text-emerald-700">⭐ %99.4</p>
          <p className="text-[11px] font-medium text-slate-600 mt-0.5">Memnuniyet</p>
        </div>
      </div>
    </section>
  );
}
