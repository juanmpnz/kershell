import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kershell TI | Enterprise Systems, SaaS & Applied AI",
  description:
    "Senior software engineering for professional SaaS, internal IT systems, real-time AI engines, and complex enterprise platforms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
