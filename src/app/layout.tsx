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
      <body className={`${poppins.variable} ${bricolage.variable} font-sans bg-noise antialiased selection:bg-accent selection:text-accent-foreground`}>
        {children}
      </body>
    </html>
  );
}
