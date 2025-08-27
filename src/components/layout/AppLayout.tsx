import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { Sprout } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      {/* Global Header */}
      <header className="h-16 flex items-center justify-between bg-gradient-to-r from-primary to-primary-glow px-4 shadow-soft">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-primary-foreground hover:bg-white/10 rounded-md p-2" />
          <div className="flex items-center gap-2">
            <Sprout className="h-7 w-7 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">Seed Organizer</h1>
              <p className="text-sm text-primary-foreground/80">Srinivas Reddy</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <OfflineIndicator />
        </div>
      </header>

      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 bg-background p-4 md:p-6 overflow-auto main-content">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}