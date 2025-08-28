import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function FloatingActionButton({ className, onClick, href }: FloatingActionButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={cn(
        "fixed bottom-4 right-4 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "sm:bottom-6 sm:right-6 md:bottom-8 md:right-8",
        "touch-target mobile-safe-area",
        "hidden md:flex", // Hide on mobile, show on desktop
        className
      )}
      size="icon"
    >
      <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
    </Button>
  );
}