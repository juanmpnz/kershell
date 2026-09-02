import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/dashboard/AppShell";
import { getSubscriptions, getUser } from "@/lib/dashboard/store";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dashboard | Kershell TI",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = getUser();
  const [firstName = "Usuario", lastName = ""] = user.name.split(" ");
  const initials = `${firstName[0] ?? "U"}${lastName[0] ?? ""}`.toUpperCase();
  const trialsExpiring = getSubscriptions({ status: "trial", daysToEnd: 7 }).length;

  return (
    <html lang="es" className={`${geist.variable} ${geistMono.variable} dark`}>
      <body className="bg-ink font-sans text-text antialiased">
        <AppShell
          trialsExpiring={trialsExpiring}
          userInitials={initials}
          userName={firstName}
          userRole={user.role}
        >
          {children}
        </AppShell>
      </body>
    </html>
  );
}
