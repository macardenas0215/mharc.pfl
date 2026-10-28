import type { Metadata } from "next";
import "./globals.css";
import { profile, safeUrl } from "@/data/portfolio";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mharc Angelo S. Cardenas | Aspiring IT Professional",
    template: "%s | Mharc Angelo Cardenas",
  },
  description:
    "Mharc Angelo S. Cardenas is an aspiring IT professional and full-stack developer from Caloocan City, Philippines. Explore his portfolio, projects, skills, and contact information.",
  keywords: [
    "Mharc Angelo S. Cardenas",
    "Mharc Cardenas",
    "IT professional Philippines",
    "full-stack developer Caloocan",
    "web developer portfolio",
    "Information Technology student",
  ],
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "Mharc Angelo S. Cardenas | Aspiring IT Professional",
    description:
      "Portfolio of Mharc Angelo S. Cardenas — aspiring IT professional, full-stack developer, and IT systems enthusiast.",
    type: "website",
    locale: "en_PH",
    url: "/",
    siteName: "Mharc Angelo Cardenas",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mharc Angelo S. Cardenas — developer portfolio",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const sameAs = [
    profile.facebook,
    profile.instagram,
    profile.github,
    profile.linkedin,
  ].filter((value): value is string => Boolean(safeUrl(value)));
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: profile.name,
        url: siteUrl,
        jobTitle: profile.titles[0],
        description: profile.introduction,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Caloocan City",
          addressRegion: "Metro Manila",
          addressCountry: "PH",
        },
        ...(profile.showPhone && profile.phone
          ? { telephone: profile.phone }
          : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Mharc Angelo Cardenas",
        description:
          "Personal developer portfolio for Mharc Angelo S. Cardenas.",
        publisher: { "@id": `${siteUrl}/#person` },
      },
    ],
  };
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
