"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";
import { ACB_SHELL_MAX_W, ACB_ICON_STROKE } from "@/lib/design-tokens";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { OpeningLogo } from "@/components/acb/OpeningLogo";
import { ArrowLeft } from "lucide-react";

type FaturaOzet = {
  id: string;
  belgeNo: string;
  createdAt: string;
  tutar: number | null;
  paketTl: number | null;
  miktar: number | null;
  odemeReferans: string | null;
};

function FaturalarIcerik() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const odak = searchParams.get("odak");

  const [faturalar, setFaturalar] = useState<FaturaOzet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [indirId, setIndirId] = useState<string | null>(null);

  useEffect(() => {
    let iptal = false;
    (async () => {
      setLoading(true);
      setError("");
      const me = await cekiciFetch("/api/cekici/me");
      if (!me.ok) {
        router.replace(
          `/cekici/giris?next=${encodeURIComponent("/cekici/faturalar")}&mesaj=fatura`
        );
        return;
      }
      const res = await cekiciFetch("/api/cekici/faturalar");
      if (!res.ok) {
        if (!iptal) {
          setError("Faturalar yüklenemedi.");
          setLoading(false);
        }
        return;
      }
      const d = await res.json();
      if (!iptal) {
        setFaturalar(Array.isArray(d.faturalar) ? d.faturalar : []);
        setLoading(false);
      }
    })().catch(() => {
      if (!iptal) {
        setError("Faturalar yüklenemedi.");
        setLoading(false);
      }
    });
    return () => {
      iptal = true;
    };
  }, [router]);

  useEffect(() => {
    if (!odak || loading) return;
    const el = document.getElementById(`fatura-${odak}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [odak, loading, faturalar]);

  async function pdfIndir(id: string) {
    setIndirId(id);
    setError("");
    try {
      const res = await cekiciFetch(`/api/cekici/faturalar/${id}/pdf`);
      if (!res.ok) {
        setError(
          res.status === 401
            ? "Giriş gerekli."
            : "PDF indirilemedi."
        );
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fatura-${id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("PDF indirilemedi.");
    } finally {
      setIndirId(null);
    }
  }

  return (
    <MobileShell hideHeader>
      <OpeningLogo
        forceDocked={true}
        leading={
          <Link
            href="/cekici/panel?tab=hesabim"
            className="flex shrink-0 items-center justify-center size-8 rounded-full bg-slate-100/90 text-slate-700 hover:bg-slate-200 transition active:scale-95 touch-manipulation cursor-pointer"
            aria-label="Geri"
          >
            <ArrowLeft className="size-4" strokeWidth={ACB_ICON_STROKE} />
          </Link>
        }
        center={
          <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate">
            Faturalarım
          </span>
        }
      />
      <div className={`px-4 py-4 ${ACB_SHELL_MAX_W} mx-auto space-y-4`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Faturalarım</h1>
            <p className="text-sm text-slate-500 mt-1">
              Size gönderilen faturaları buradan indirebilirsiniz.
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Yükleniyor…</p>
        ) : faturalar.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">
              Henüz fatura kaydınız yok. Fatura düzenlenince SMS ile
              bilgilendirilirsiniz.
            </p>
            <Link href="/cekici/kredi" className="inline-block mt-3">
              <Btn className="w-auto min-h-0 py-2 px-4 text-sm">Kredi al</Btn>
            </Link>
          </Card>
        ) : (
          <ul className="space-y-3">
            {faturalar.map((f) => {
              const vurgulu = odak === f.id;
              const tarih = new Date(f.createdAt).toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              });
              return (
                <li key={f.id} id={`fatura-${f.id}`}>
                  <Card
                    className={
                      vurgulu
                        ? "border-amber-400 ring-2 ring-amber-200"
                        : undefined
                    }
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {tarih}
                        </p>
                        <p className="text-sm text-slate-600">
                          {f.tutar != null
                            ? `${f.tutar.toLocaleString("tr-TR")} TL`
                            : "—"}
                          {f.miktar != null ? ` · ${f.miktar} kredi` : ""}
                          {f.paketTl != null ? ` · paket ${f.paketTl} TL` : ""}
                        </p>
                        <p className="text-xs text-slate-400 font-mono truncate">
                          {f.belgeNo}
                        </p>
                      </div>
                      <Btn
                        className="w-auto min-h-0 py-2 px-3 text-sm shrink-0"
                        disabled={indirId === f.id}
                        onClick={() => void pdfIndir(f.id)}
                      >
                        {indirId === f.id ? "İndiriliyor…" : "PDF indir"}
                      </Btn>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </MobileShell>
  );
}

export default function FaturalarPage() {
  return (
    <Suspense
      fallback={
        <MobileShell subtitle="Faturalarım">
          <p className="px-4 py-8 text-sm text-slate-500">Yükleniyor…</p>
        </MobileShell>
      }
    >
      <FaturalarIcerik />
    </Suspense>
  );
}
