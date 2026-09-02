import type { Metadata } from "next";
import "./globals.css";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kershell.io");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Kershell TI | Enterprise Systems, SaaS & Applied AI",
  description:
    "Senior software engineering for professional SaaS, internal IT systems, real-time AI engines, and complex enterprise platforms.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    images: [
      {
        url: "/og/default.svg",
        width: 1200,
        height: 630,
        alt: "Kershell TI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/default.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
