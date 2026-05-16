import { Suspense } from "react";
import CekiciTalepClient from "./CekiciTalepClient";

export default function CekiciTalepPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-slate-400 py-12 min-h-dvh flex items-center justify-center">
          Yükleniyor…
        </p>
      }
    >
      <CekiciTalepClient />
    </Suspense>
  );
}
