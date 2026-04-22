import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kershell TI | AI-Powered Software Consulting — Velocity, Quality, Security",
  description:
    "Enterprise software consulting accelerated by AI. Custom SaaS, web platforms, and automation. 3x faster delivery, human-reviewed quality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
