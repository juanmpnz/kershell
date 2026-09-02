import type { ReactNode } from "react";
import { DashSidebar } from "@/components/dashboard/DashSidebar";
import { DashTopbar } from "@/components/dashboard/DashTopbar";

type AppShellProps = {
  children: ReactNode;
  trialsExpiring?: number;
  userInitials?: string;
  userName?: string;
  userRole?: string;
};

export function AppShell({
  children,
  trialsExpiring = 0,
  userInitials,
  userName,
  userRole,
}: AppShellProps) {
  return (
    <div className="flex h-svh overflow-hidden bg-ink text-text">
      <DashSidebar
        trialsExpiring={trialsExpiring}
        userInitials={userInitials}
        userName={userName}
        userRole={userRole}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashTopbar />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
