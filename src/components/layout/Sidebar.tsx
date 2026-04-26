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
  Search,
  LogOut,
  Zap,
  Settings,
  Hammer,
  Star,
  CreditCard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TRADIE_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "My Jobs", icon: Briefcase },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/licenses", label: "Licences", icon: Award },
  { href: "/compliance", label: "Compliance", icon: ShieldCheck },
  { href: "/jobs-board", label: "Jobs Board", icon: Search },
  { href: "/my-bids", label: "My Bids", icon: Hammer },
  { href: "/profile", label: "Public Profile", icon: Star },
  { href: "/settings", label: "Settings", icon: Settings },
];

const HOMEOWNER_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-jobs", label: "My Posted Jobs", icon: Briefcase },
  { href: "/post-job", label: "Post a Job", icon: Hammer },
  { href: "/find-tradies", label: "Find Tradies", icon: Search },
  { href: "/settings", label: "Settings", icon: Settings },
];

const ADMIN_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/associations", label: "Associations", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ role = "TRADIE" }: { role?: string }) {
  const pathname = usePathname();
  const items = role === "HOMEOWNER" ? HOMEOWNER_NAV : role === "ADMIN" ? ADMIN_NAV : TRADIE_NAV;

  return (
    <aside className="w-60 min-h-screen bg-zinc-900 text-white flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">48co</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"))
                ? "bg-orange-500 text-white"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
