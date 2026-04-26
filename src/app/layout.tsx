import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "48co — AI Platform for Trades & Construction",
  description: "AI-powered quoting, invoicing, compliance, and license management for Australian and New Zealand tradespeople.",
  manifest: "/manifest.json",
  themeColor: "#f97316",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "48co" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-50 font-sans">{children}</body>
    </html>
  );
}
