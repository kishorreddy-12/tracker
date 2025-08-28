import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={`shadow-card hover:shadow-lg transition-all ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground break-all">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-success' : 'text-destructive'} mt-1`}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}