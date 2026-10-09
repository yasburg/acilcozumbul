import type { MetadataRoute } from "next";
import {
  SEO_YAYIN_SEHIRLER,
  seoDerinSehirMi,
  seoIlceHizmetIndexlensinMi,
  seoSitemapIlceSluglari,
} from "@/data/seo-yayin";
import { rehberSluglari } from "@/data/rehber";
import { seoSehirListesi } from "@/lib/seo-geo";
import { SITE_URL } from "@/lib/seo";
import { SEO_HIZMET_SLUGS } from "@/lib/seo-hizmetler";

const SITE = SITE_URL;

type Entry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

function statikSayfalar(): Entry[] {
  return [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/hizmet-veren", changeFrequency: "weekly", priority: 0.85 },
    { path: "/rehber", changeFrequency: "weekly", priority: 0.85 },
    {
      path: "/cekici-fiyat-hesaplama",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { path: "/is-birligi", changeFrequency: "monthly", priority: 0.7 },
    { path: "/nasil-calisir", changeFrequency: "monthly", priority: 0.65 },
    { path: "/hakkimizda", changeFrequency: "monthly", priority: 0.65 },
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
  for (const sehir of seoSehirListesi()) {
    out.push({
      path: `/${sehir.slug}`,
      changeFrequency: "weekly",
      priority: sehir.slug === "istanbul" ? 1 : 0.95,
    });
  }
  for (const sehir of SEO_YAYIN_SEHIRLER) {
    const derin = seoDerinSehirMi(sehir);
    for (const hizmet of SEO_HIZMET_SLUGS) {
      out.push({
        path: `/${sehir}/${hizmet}`,
        changeFrequency: "weekly",
        priority: derin ? 0.95 : 0.85,
      });
    }
    for (const ilce of seoSitemapIlceSluglari(sehir)) {
      out.push({
        path: `/${sehir}/${ilce}`,
        changeFrequency: "weekly",
        priority: derin ? 0.8 : 0.75,
      });
      // İlçe × hizmet: büyük 5 + kalite kapısı (Faz E)
      if (!derin) continue;
      for (const hizmet of SEO_HIZMET_SLUGS) {
        if (!seoIlceHizmetIndexlensinMi(sehir, ilce, hizmet)) continue;
        out.push({
          path: `/${sehir}/${ilce}/${hizmet}`,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }
  return out;
}

function rehberSayfalari(): Entry[] {
  return rehberSluglari().map((slug) => ({
    path: `/rehber/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const sayfalar = [
    ...statikSayfalar(),
    ...rehberSayfalari(),
    ...yerelSeoSayfalari(),
  ];
  return sayfalar.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? SITE : `${SITE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
