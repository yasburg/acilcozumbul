"use client";

import { useEffect, useState } from "react";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { Card } from "@/components/ui";
import type { CekiciMusaitlikDurumu } from "@/lib/types";

const SECENEKLER: Array<{ id: CekiciMusaitlikDurumu; baslik: string; aciklama: string; style: string }> = [
  { id: "online", baslik: "Online", aciklama: "Yeni işlerde öncelik al", style: "border-emerald-300 bg-emerald-50 text-emerald-900" },
  { id: "busy", baslik: "Meşgul", aciklama: "Yeni otomatik talep alma", style: "border-amber-300 bg-amber-50 text-amber-950" },
  { id: "offline", baslik: "Offline", aciklama: "Yeni otomatik talep alma", style: "border-slate-300 bg-slate-100 text-slate-700" },
  { id: "auto", baslik: "Otomatik", aciklama: "Saat ve bölge ayarını kullan", style: "border-blue-300 bg-blue-50 text-blue-900" },
];

export function AnlikMusaitlik() {
  const [status, setStatus] = useState<CekiciMusaitlikDurumu>("auto");
  const [saving, setSaving] = useState(false);
  useEffect(() => { void cekiciFetch("/api/cekici/availability").then(async (r) => {
    if (r.ok) setStatus(((await r.json()).availabilityStatus ?? "auto") as CekiciMusaitlikDurumu);
  }); }, []);
  async function sec(next: CekiciMusaitlikDurumu) {
    const onceki = status; setStatus(next); setSaving(true);
    try {
      const r = await cekiciFetch("/api/cekici/availability", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ availabilityStatus: next }) });
      if (!r.ok) throw new Error();
    } catch { setStatus(onceki); } finally { setSaving(false); }
  }
  return <Card className="space-y-3">
    <div><h3 className="text-sm font-bold text-slate-800">Şu an iş alıyor musunuz?</h3><p className="mt-1 text-xs text-slate-600">Bu seçim yalnızca otomatik talep dağıtımını etkiler; açık talepleri panelde görebilirsiniz.</p></div>
    <div className="grid grid-cols-2 gap-2">
      {SECENEKLER.map((s) => <button key={s.id} type="button" disabled={saving} onClick={() => void sec(s.id)} className={`rounded-xl border px-3 py-2.5 text-left text-xs transition disabled:opacity-60 ${status === s.id ? s.style : "border-slate-200 bg-white text-slate-600"}`}>
        <span className="block font-bold">{s.baslik}</span><span className="mt-0.5 block opacity-80">{s.aciklama}</span>
      </button>)}
    </div>
  </Card>;
}
