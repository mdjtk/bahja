import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import Analytics from "@/components/Analytics";

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

export const metadata: Metadata = {
  title: {
    default: "Buy Pure Honey Online | Raw Natural Honey In India – Bahja",
    template: "%s | Bahja Pure Honey",
  },
  description:
    "Bahja brings you pure, raw honey direct from Kerala beehives. Shop Premium Wild Honey & Medicinal Stingless Bee Honey. 100% pure, no additives.",
  keywords: ["bahja", "honey", "pure honey", "raw honey", "natural honey", "Kerala honey", "Indian honey"],
  icons: {
    icon: "/assets/images/logo.png",
    apple: "/assets/images/logo.png",
  },
  openGraph: {
    title: "Bahja – Pure, Raw Honey from Kerala",
    description:
      "Shop pure, raw honey from Bahja. Premium Wild Honey & Medicinal Stingless Bee Honey. Direct from Kerala beehives.",
    type: "website",
    url: "https://bahjahoney.com",
    siteName: "Bahja Pure Honey",
    locale: "en_IN",
    images: [{ url: "https://bahjahoney.com/assets/images/logo.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bahja – Pure, Raw Honey from Kerala",
    description: "Shop pure, raw honey from Bahja. Premium Wild Honey & Medicinal Stingless Bee Honey.",
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
        <ErrorBoundary>
          <ClientLayout>{children}</ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
