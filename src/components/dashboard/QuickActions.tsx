import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, CreditCard, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Add Payment",
      description: "Log a new payment to suborganizer",
      icon: Plus,
      action: () => navigate("/add-payment"),
      variant: "default" as const
    },
    {
      title: "Manage Suborganizers", 
      description: "Add or edit suborganizer details",
      icon: Users,
      action: () => navigate("/suborganizers"),
      variant: "secondary" as const
    },
    {
      title: "View Payments",
      description: "See all payment history",
      icon: CreditCard,
      action: () => navigate("/payments"),
      variant: "outline" as const
    },
    {
      title: "Generate Reports",
      description: "Create detailed reports",
      icon: FileText,
      action: () => navigate("/reports"),
      variant: "outline" as const
    }
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start gap-2 text-left"
              onClick={action.action}
            >
              <div className="flex items-center gap-2 w-full">
                <action.icon className="h-5 w-5" />
                <span className="font-medium">{action.title}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-tight">
                {action.description}
              </p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}