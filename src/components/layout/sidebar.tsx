"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const defaultNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  appName: string;
  navItems?: NavItem[];
}

export function Sidebar({ appName, navItems = defaultNavItems }: SidebarProps) {
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-16 items-center border-b border-zinc-200 px-6">
        <Link href="/" className="text-lg font-bold text-zinc-900">
          {appName}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
