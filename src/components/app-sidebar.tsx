"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Brain, FolderKanban, Home, Settings, Activity, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: Home },
  { href: "/app/projects", label: "Projects", icon: FolderKanban },
  { href: "/app/memory", label: "Memory", icon: Brain },
  { href: "/app/activity", label: "Activity", icon: Activity },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-card/40 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border">
        <Link href="/app" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-gradient-to-br from-foreground to-foreground/60 flex items-center justify-center">
            <Sparkles className="size-4 text-background" />
          </div>
          <span className="font-bold text-lg tracking-tight">48Co</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <Link
          href="/app/projects/new"
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-3"
        >
          <Plus className="size-4" /> New project
        </Link>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border flex items-center gap-3">
        <UserButton afterSignOutUrl="/" />
        <div className="text-xs text-muted-foreground">Admin</div>
      </div>
    </aside>
  );
}
