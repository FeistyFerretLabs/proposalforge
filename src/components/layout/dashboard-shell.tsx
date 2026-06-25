import { type NavItem, Sidebar } from "./sidebar";

interface DashboardShellProps {
  appName: string;
  navItems?: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  appName,
  navItems,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex h-screen bg-zinc-50">
      <Sidebar appName={appName} navItems={navItems} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-8">{children}</div>
      </main>
    </div>
  );
}
