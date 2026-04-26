"use client";
import { Bell, Search } from "lucide-react";

interface TopBarProps {
  title: string;
  userName?: string;
}

export function TopBar({ title, userName }: TopBarProps) {
  return (
    <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-medium">
            {userName?.charAt(0).toUpperCase() || "T"}
          </div>
          <span className="text-sm text-zinc-700 font-medium">{userName || "Tradesperson"}</span>
        </div>
      </div>
    </header>
  );
}
