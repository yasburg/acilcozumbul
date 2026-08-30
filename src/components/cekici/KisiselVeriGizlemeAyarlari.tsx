"use client";

import { useKisiselVeriGizle } from "@/hooks/useKisiselVeriGizle";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";

/** Ekranda ad, soyad ve telefonu gizler (ekran paylaşımı / demo için). */
export function KisiselVeriGizlemeAyarlari() {
  const { gizli, ayarla } = useKisiselVeriGizle();
  const Shield = AcbIcons.shield;
  const HelpCircle = AcbIcons.helpCircle;
  const MessageCircle = AcbIcons.messageCircle;

  return (
    <div className="space-y-4">
      {/* Gizlilik Kartı */}
      <div
        className={`rounded-2xl border p-4 transition-all shadow-sm ${
          gizli
            ? "border-emerald-300 bg-emerald-50/50"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Shield
                className={`size-4 shrink-0 ${
                  gizli ? "text-emerald-600" : "text-slate-500"
                }`}
                strokeWidth={ACB_ICON_STROKE}
              />
              <span className="text-sm font-bold text-slate-900">
                Kişisel Verileri Gizle
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              Açıkken <strong>Hesabım</strong> sekmesindeki ad ve telefon numaranız maskelenir. Ekran paylaşımı ve demo gösterimlerinde kişisel bilgileriniz korunur.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={gizli}
            aria-label="Kişisel verileri gizle"
            onClick={() => ayarla(!gizli)}
            className={`relative shrink-0 w-12 h-7 rounded-full transition-colors cursor-pointer ${
              gizli ? "bg-emerald-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                gizli ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {gizli && (
          <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 animate-fade-in">
            <span className="size-2 rounded-full bg-emerald-500" />
            Gizleme aktif: Profil ve telefon numaranız ekranda maskeleniyor.
          </div>
        )}
      </div>

      {/* Yardım & Destek Hızlı Erişim */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
          Yardım & Destek
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a
            href="https://wa.me/908503020560?text=Merhaba,%20çekici%20paneli%20ayarları%20hakkında%20bilgi%20almak%20istiyorum."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-xs font-semibold text-slate-700 hover:text-emerald-950"
          >
            <MessageCircle className="size-4 text-emerald-600 shrink-0" strokeWidth={ACB_ICON_STROKE} />
            <span>WhatsApp Destek Hattı</span>
          </a>

          <a
            href="/destek"
            className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs font-semibold text-slate-700"
          >
            <HelpCircle className="size-4 text-slate-500 shrink-0" strokeWidth={ACB_ICON_STROKE} />
            <span>Sıkça Sorulan Sorular</span>
          </a>
        </div>
      </div>
    </div>
  );
}
