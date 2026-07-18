/** Shared site SEO + ownership constants for PDF Workshop */

export const OWNER = {
  name: "Sutio",
  legalName: "Sutio",
  url: "https://www.sutio.co/",
  email: "siyam.uddin.talha@gmail.com",
  description:
    "Sutio builds web apps, mobile and desktop software, LLM products, and bespoke systems for startups and enterprises.",
} as const;

/** Canonical product domain (Sutio subdomain). Override with NEXT_PUBLIC_SITE_URL if needed. */
export const DEFAULT_SITE_URL = "https://pdf-workshop.sutio.co";

export const SITE = {
  name: "PDF Workshop",
  host: "pdf-workshop.sutio.co",
  tagline: "Secure Private PDF Editor",
  description:
    "An elegant, browser-powered PDF workshop. Merge, split, reorder, rotate, watermark, protect, and compress PDFs locally and securely. 100% private, no uploads.",
  keywords: [
    "pdf workshop",
    "pdf editor",
    "merge pdf",
    "split pdf",
    "compress pdf",
    "watermark pdf",
    "secure pdf",
    "pdf lock",
    "local pdf editor",
    "browser pdf tool",
    "Sutio",
    "pdf-workshop.sutio.co",
  ],
  get url() {
    return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
  },
  /** Social / link preview image (Open Graph + Twitter) */
  ogImage: {
    path: "/og.png",
    width: 1448,
    height: 1086,
    alt: "PDF Workshop — Secure Private PDF Editor",
    type: "image/png",
  },
} as const;

export function absoluteUrl(path = "/") {
  const base = SITE.url;
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function ogImageUrl() {
  return absoluteUrl(SITE.ogImage.path);
}
