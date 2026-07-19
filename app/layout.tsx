import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import Analytics from "@/components/Analytics";
import OrganizationSchema from "@/components/OrganizationSchema";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-playfair",
});

const baseUrl = "https://bahjahoney.com";

export const metadata: Metadata = {
  title: {
    default: "Buy Pure Honey Online | Raw Natural Honey In India – Bahja",
    template: "%s | Bahja Pure Honey",
  },
  description:
    "Bahja brings you pure, raw honey direct from Kerala beehives. Shop Premium Wild Honey & Medicinal Stingless Bee Honey. 100% pure, no additives.",
  keywords: ["bahja", "raw honey online", "raw honey price", "raw honey for weight loss", "raw honey Benefits", "raw honey in india", "raw honey india", "raw honey price in india","raw honey benefits in hindi", "raw honey calories", "raw honey buy online", "raw honey buy online india", "raw honey cancer", "raw honey for diabetes", "raw honey for weight gain", "raw honey for cough", "raw honey for weight loss in hindi", "raw honey for immunity", "raw honey for skin", "raw honey for hair", "raw honey for periods", "raw honey for pregnancy", "raw honey for joints pain", "raw honey for children", "raw honey for weight gain in hindi", "raw honey for hair", "raw honey for skin", "raw honey for weight loss in hindi", "raw honey for immunity", "raw honey for skin", "raw honey for hair", "raw honey for periods", "raw honey for pregnancy", "raw honey for joints pain", "raw honey for children", "raw honey for weight gain in hindi", "honey", "pure honey", "raw honey", "natural honey", "Kerala honey", "Indian honey", "wild honey", "stingless bee honey"],
  icons: {
    icon: "/favicon.ico",
    apple: "/assets/images/logo.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Bahja – Pure, Raw Honey from Kerala",
    description:
      "Shop pure, raw honey from Bahja. Premium Wild Honey & Medicinal Stingless Bee Honey. Direct from Kerala beehives.",
    type: "website",
    url: baseUrl,
    siteName: "Bahja Pure Honey",
    locale: "en_IN",
    images: [
      {
        url: `${baseUrl}/assets/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Bahja Pure Honey – Raw, Natural Honey from Kerala",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bahja – Pure, Raw Honey from Kerala",
    description: "Shop pure, raw honey from Bahja. Premium Wild Honey & Medicinal Stingless Bee Honey.",
    images: [`${baseUrl}/assets/images/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <body>
        <Analytics />
        <OrganizationSchema />
        <ErrorBoundary>
          <ClientLayout>{children}</ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
