import type { Metadata } from "next";
import { Bricolage_Grotesque, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap"
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Tela Blog | Insights on Global Payments & Business",
    template: "%s | Tela Blog",
  },
  description: "Discover expert insights on borderless business, global payments, multi-currency finance, and tools for modern companies operating across Africa and the world.",
  keywords: ["global payments", "fintech Africa", "business blog", "cross-border payments", "virtual dollar card", "Nigeria fintech", "Tela", "USD account Nigeria"],
  authors: [{ name: "Tela Team" }],
  creator: "Tela Technologies",
  publisher: "Tela",
  metadataBase: new URL("https://tela.ng"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tela Blog | Insights on Global Payments & Business",
    description: "Discover expert insights on borderless business, global payments, and financial tools for modern companies.",
    siteName: "Tela Blog",
    type: "website",
    locale: "en_US",
    url: "https://tela.ng",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tela Blog | Insights on Global Payments & Business",
    description: "Discover expert insights on borderless business, global payments, and financial tools for modern companies.",
    creator: "@taborahq",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { Toaster } from "sonner";
import { PageTracker } from "@/components/layout/PageTracker";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Organization schema for Google Knowledge Graph
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tela",
    url: "https://tela.ng",
    logo: "https://tela.ng/images/logo.PNG",
    sameAs: [
      "https://twitter.com/taborahq",
      "https://linkedin.com/company/tela",
      "https://instagram.com/tela",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className={`${poppins.variable} ${bricolage.variable} font-sans bg-noise antialiased selection:bg-accent selection:text-accent-foreground`}>
        <Suspense fallback={null}>
          <PageTracker />
        </Suspense>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
