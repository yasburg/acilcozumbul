import { Suspense } from "react";
import CekiciPanelTabs from "@/components/CekiciPanelTabs";

export default function CekiciPanelPage() {
  return (
    <Suspense
      fallback={
        <p className="text-center text-slate-500 py-12 min-h-dvh flex items-center justify-center">
          Yükleniyor…
        </p>
      }
    >
      <CekiciPanelTabs />
    </Suspense>
  );
}
