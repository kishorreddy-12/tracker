import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Plus, 
  CreditCard, 
  BarChart3 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Suborganizers", url: "/suborganizers", icon: Users },
  { title: "Add", url: "/add-payment", icon: Plus, isSpecial: true },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Reports", url: "/reports", icon: BarChart3 }
];

export function MobileBottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40 md:hidden mobile-safe-area">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = currentPath === item.url;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] touch-target",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                item.isSpecial && "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mb-1",
                item.isSpecial && "h-6 w-6"
              )} />
              <span className={cn(
                "text-xs font-medium",
                item.isSpecial && "text-xs"
              )}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}