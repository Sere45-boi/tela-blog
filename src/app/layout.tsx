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
    default: "Pulse by Tela",
    template: "%s",
  },
  description: "Stay up-to-date with the latest financial news. Discover helpful financial strategies, business tips, and trends for financial management",
  keywords: "Tela blog, Tela, Pulse, Pulse by tela, AI-powered solutions, financial management, African SMEs, invoicing, international payments, TELA",
  authors: [{ name: "Tela" }],
  creator: "Tela",
  publisher: "Tela",
  metadataBase: new URL("https://tela.ng"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pulse by Tela | Insights and stories from Tela",
    description: "Stay up-to-date with the latest financial news. Discover helpful financial strategies, business tips, and trends for financial management",
    siteName: "Pulse by Tela",
    type: "website",
    locale: "en_US",
    url: "https://tela.ng",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse by Tela | Insights and stories from Tela",
    description: "Stay up-to-date with the latest financial news. Discover helpful financial strategies, business tips, and trends for financial management",
    creator: "@mytelaapp",
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
import { SessionGuardian } from "@/components/admin/SessionGuardian";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Suspense } from "react";
import Script from "next/script";

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
      "https://x.com/mytelaapp",
      "https://www.linkedin.com/company/telang",
      "https://www.instagram.com/mytelaapp/",
      "https://www.tiktok.com/@mytelaapp",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body suppressHydrationWarning className={`${poppins.variable} ${bricolage.variable} font-sans bg-noise antialiased selection:bg-accent selection:text-accent-foreground`}>
        {/* Google Analytics Tag */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX"}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || "G-XXXXXXXXXX"}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />

        <Suspense fallback={null}>
          <PageTracker />
          <SessionGuardian />
        </Suspense>
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
