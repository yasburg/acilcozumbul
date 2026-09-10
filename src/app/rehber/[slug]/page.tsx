import { notFound } from "next/navigation";
import { RehberMakaleShell } from "@/components/seo/RehberMakaleShell";
import { rehberSluglari, rehberYaziGetir } from "@/data/rehber";
import { sayfaMetadata } from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return rehberSluglari().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const yazi = rehberYaziGetir(slug);
  if (!yazi) return {};
  return sayfaMetadata({
    title: yazi.title,
    description: yazi.description,
    path: `/rehber/${yazi.slug}`,
  });
}

export default async function RehberYaziPage({ params }: Props) {
  const { slug } = await params;
  const yazi = rehberYaziGetir(slug);
  if (!yazi) notFound();
  return <RehberMakaleShell yazi={yazi} />;
}
