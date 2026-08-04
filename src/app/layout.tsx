import type { Metadata, Viewport } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "KS Data — Filan Filani",
  description:
    "Runner-Portal: Regjistro bizneset e Kosovës dhe fito 0,50 € për çdo regjistrim të aprovuar.",
  // Vom Home-Bildschirm gestartet ohne Safari-Leisten (sonst überdeckt die
  // Browser-Leiste die untere Navigation)
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Filan Filani" },
};

// viewport-fit=cover macht env(safe-area-inset-*) überhaupt erst nutzbar
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#12574F",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
