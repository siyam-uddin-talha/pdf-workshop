import type { Metadata } from 'next';
import { Inter, Outfit, JetBrains_Mono } from 'next/font/google';
import '../global.css';
import { OWNER, SITE, absoluteUrl, ogImageUrl } from '@/lib/seo';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const ogImages = [
  {
    url: SITE.ogImage.path,
    secureUrl: ogImageUrl(),
    width: SITE.ogImage.width,
    height: SITE.ogImage.height,
    alt: SITE.ogImage.alt,
    type: SITE.ogImage.type,
  },
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline} | ${OWNER.name}`,
    template: `%s · ${SITE.name} by ${OWNER.name}`,
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  applicationName: SITE.name,
  authors: [{ name: OWNER.name, url: OWNER.url }],
  creator: OWNER.name,
  publisher: OWNER.name,
  category: "utility",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    siteName: `${SITE.name} · ${SITE.host}`,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: SITE.ogImage.path,
        width: SITE.ogImage.width,
        height: SITE.ogImage.height,
        alt: SITE.ogImage.alt,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/logo.png", type: "image/png" }
    ],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  other: {
    "application-name": SITE.name,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body suppressHydrationWarning className="bg-[#f4f7f5] text-[#163327] antialiased">
        {children}
      </body>
    </html>
  );
}
