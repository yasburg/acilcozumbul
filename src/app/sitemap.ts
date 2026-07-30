import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const SITE = SITE_URL;

/** Genel erişime açık sayfalar — panel, oturum ve dinamik talep yolları hariç */
const SAYFALAR: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/kayit/a", changeFrequency: "weekly", priority: 0.9 },
  { path: "/kayit/b", changeFrequency: "weekly", priority: 0.9 },
  { path: "/kayit/c", changeFrequency: "weekly", priority: 0.85 },
  { path: "/kayit/d", changeFrequency: "weekly", priority: 0.85 },
  { path: "/kayit/e", changeFrequency: "weekly", priority: 0.85 },
  { path: "/cekici/giris", changeFrequency: "monthly", priority: 0.7 },
  { path: "/cekici/sifremi-unuttum", changeFrequency: "monthly", priority: 0.4 },
  { path: "/kullanim-kosullari", changeFrequency: "yearly", priority: 0.3 },
  { path: "/gizlilik-politikasi", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cerez-politikasi", changeFrequency: "yearly", priority: 0.3 },
  { path: "/iptal-ve-iade", changeFrequency: "yearly", priority: 0.3 },
  {
    path: "/mesafeli-hizmet-sozlesmesi",
    changeFrequency: "yearly",
    priority: 0.3,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return SAYFALAR.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? SITE : `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
