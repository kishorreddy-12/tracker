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
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "md:bottom-8 md:right-8",
        className
      )}
      size="icon"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}