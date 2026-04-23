import { AppSidebar } from "@/components/app-sidebar";
import { CostHud } from "@/components/cost-hud";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/30 backdrop-blur-sm">
          <div className="text-sm text-muted-foreground font-mono">app.48co.ai</div>
          <CostHud />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
