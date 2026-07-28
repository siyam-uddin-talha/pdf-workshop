import { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkshopView } from "@/sections/workshop-view";
import { TOOL_PAGES, getToolPageConfig } from "@/lib/tool-pages";
import { SITE, absoluteUrl, ogImageUrl } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(TOOL_PAGES).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const config = getToolPageConfig(slug);

  if (!config) {
    return {};
  }

  const pageUrl = absoluteUrl(`/${slug}`);

  return {
    title: config.title,
    description: config.description,
    keywords: [...config.keywords, ...SITE.keywords],
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      type: "website",
      url: pageUrl,
      title: config.title,
      description: config.description,
      siteName: `${SITE.name} · ${SITE.host}`,
      images: [
        {
          url: SITE.ogImage.path,
          secureUrl: ogImageUrl(),
          width: SITE.ogImage.width,
          height: SITE.ogImage.height,
          alt: config.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [SITE.ogImage.path],
    },
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const config = getToolPageConfig(slug);

  if (!config) {
    notFound();
  }

  return (
    <WorkshopView
      initialTab={config.tab}
      pageTitle={config.h1Title}
      pageDescription={config.heroDescription}
    />
  );
}
