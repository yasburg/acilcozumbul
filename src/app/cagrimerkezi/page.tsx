import type { Metadata } from "next";
import { CagrimerkeziEkran } from "@/components/acb/CagrimerkeziEkran";

export const metadata: Metadata = {
  title: "Çağrı merkezi",
  robots: { index: false, follow: false },
};

export default function CagrimerkeziPage() {
  return <CagrimerkeziEkran />;
}
