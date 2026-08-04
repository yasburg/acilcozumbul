import type { MetadataRoute } from "next";
import { SEO_YAYIN_SEHIRLER, seoYayinIlceSluglari } from "@/data/seo-yayin";
import { seoSehirListesi } from "@/lib/seo-geo";
import { SITE_URL } from "@/lib/seo";
import { SEO_HIZMET_SLUGS } from "@/lib/seo-hizmetler";

const SITE = SITE_URL;

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

/** Yalnızca canonical + indexable sayfalar (funnel/test yok) */
function statikSayfalar(): Entry[] {
  return [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/hizmet-veren", changeFrequency: "weekly", priority: 0.85 },
    {
      path: "/cekici-fiyat-hesaplama",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { path: "/is-birligi", changeFrequency: "monthly", priority: 0.7 },
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
}

function yerelSeoSayfalari(): Entry[] {
  const out: Entry[] = [];
  /** Tüm iller — şehir hub */
  for (const sehir of seoSehirListesi()) {
    out.push({
      path: `/${sehir.slug}`,
      changeFrequency: "weekly",
      priority: 0.95,
    });
  }
  /** Derin SEO (ilçe + hizmet) — yayın allowlist */
  for (const sehir of SEO_YAYIN_SEHIRLER) {
    for (const hizmet of SEO_HIZMET_SLUGS) {
      out.push({
        path: `/${sehir}/${hizmet}`,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
    for (const ilce of seoYayinIlceSluglari(sehir)) {
      out.push({
        path: `/${sehir}/${ilce}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
      for (const hizmet of SEO_HIZMET_SLUGS) {
        out.push({
          path: `/${sehir}/${ilce}/${hizmet}`,
          changeFrequency: "weekly",
          priority: 0.75,
        });
      }
    }
  }
  return out;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const sayfalar = [...statikSayfalar(), ...yerelSeoSayfalari()];
  return sayfalar.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? SITE : `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
