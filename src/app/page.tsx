import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, hsl(240 60% 20% / 0.4), transparent 60%), radial-gradient(ellipse at 50% 100%, hsl(280 60% 20% / 0.3), transparent 60%)",
        }}
      />
      <div className="text-center space-y-10">
        <h1 className="text-8xl md:text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
          48Co
        </h1>
        <SignedOut>
          <Link href="/sign-in">
            <Button size="lg" className="text-base px-8 h-12">
              Log in
            </Button>
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/app">
            <Button size="lg" className="text-base px-8 h-12">
              Open admin
            </Button>
          </Link>
        </SignedIn>
      </div>
    </main>
  );
}
