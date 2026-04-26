"use client";
import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface TopBarProps {
  title: string;
  userName?: string;
}

export function TopBar({ title, userName }: TopBarProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load() {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    }
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    load();
  }

  return (
    <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6 relative">
      <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-zinc-200 rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between p-3 border-b border-zinc-100">
                <h3 className="font-semibold text-zinc-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-orange-500 hover:underline flex items-center gap-1">
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-zinc-400 p-6 text-center">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link || "#"}
                      onClick={() => setOpen(false)}
                      className={`block px-4 py-3 border-b border-zinc-50 hover:bg-zinc-50 transition-colors ${!n.read ? "bg-orange-50/40" : ""}`}
                    >
                      <p className="text-sm font-medium text-zinc-900">{n.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{n.body}</p>
                      <p className="text-xs text-zinc-400 mt-1">{formatDate(n.createdAt)}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-medium">
            {userName?.charAt(0).toUpperCase() || "T"}
          </div>
          <span className="text-sm text-zinc-700 font-medium hidden sm:inline">{userName || "Tradesperson"}</span>
        </div>
      </div>
    </header>
  );
}
