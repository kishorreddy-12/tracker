import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { Sprout } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      {/* Global Header - Mobile Optimized */}
      <header className="h-14 sm:h-16 flex items-center justify-between bg-gradient-to-r from-primary to-primary-glow px-3 sm:px-4 shadow-soft sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <SidebarTrigger className="text-primary-foreground hover:bg-white/10 rounded-md p-2 flex-shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <Sprout className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-primary-foreground truncate">Seed Organizer</h1>
              <p className="text-xs sm:text-sm text-primary-foreground/80 truncate hidden sm:block">Srinivas Reddy</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <OfflineIndicator />
        </div>
      </header>

      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 bg-background p-3 sm:p-4 md:p-6 overflow-auto main-content pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </SidebarProvider>
  );
}