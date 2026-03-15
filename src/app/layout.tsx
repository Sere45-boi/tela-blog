import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tela | Insights & Updates",
  description: "Discover insights, updates, and stories from the Tela team.",
  openGraph: {
    title: "Tela | Insights & Updates",
    description: "Discover insights, updates, and stories from the Tela team.",
    siteName: "Tela",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-noise antialiased selection:bg-accent selection:text-accent-foreground`}>
        {children}
      </body>
    </html>
  );
}
