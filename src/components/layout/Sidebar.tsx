"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Briefcase,
  Award,
  ShieldCheck,
  Users,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/licenses", label: "Licenses", icon: Award },
  { href: "/compliance", label: "Compliance", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-zinc-900 text-white flex flex-col">
      <div className="p-6 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">48co</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-orange-500 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
