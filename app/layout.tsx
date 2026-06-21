import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

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
  title: "Buy Pure Honey Online | Raw Natural Honey In India – Bahja",
  description:
    "Bahja brings you pure, raw honey direct from Kerala beehives. Shop Premium Wild Honey & Medicinal Stingless Bee Honey. 100% pure, no additives.",
  keywords: "bahja, honey, pure honey, raw honey, natural honey, Kerala honey",
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
    images: [{ url: "https://bahjahoney.com/assets/images/logo.png" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
