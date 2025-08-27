import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Construction, 
  Home, 
  Calendar,
  Lightbulb,
  ArrowLeft,
  Sprout
} from "lucide-react";

interface ComingSoonProps {
  title?: string;
  description?: string;
  features?: string[];
  expectedDate?: string;
  showNavigation?: boolean;
}

export function ComingSoon({ 
  title = "Coming Soon",
  description = "This feature is currently under development and will be available soon.",
  features = [],
  expectedDate,
  showNavigation = true
}: ComingSoonProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center shadow-card">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-primary to-primary-glow rounded-full">
              <Construction className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-primary mb-2">{title}</CardTitle>
          <p className="text-muted-foreground text-lg">{description}</p>
          
          {expectedDate && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Calendar className="h-4 w-4 text-primary" />
              <Badge variant="outline" className="gap-1">
                Expected: {expectedDate}
              </Badge>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {features.length > 0 && (
            <div className="text-left">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-primary">Planned Features:</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                    <span className="text-primary font-medium">•</span> {feature}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {showNavigation && (
            <div className="pt-4 border-t">
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild variant="default" className="min-h-[44px]">
                  <Link to="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2 min-h-[44px]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
              </div>
              
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-3">Available Features:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Link to="/suborganizers" className="text-primary hover:underline">
                    Manage Suborganizers
                  </Link>
                  <Link to="/payments" className="text-primary hover:underline">
                    View Payments
                  </Link>
                  <Link to="/add-payment" className="text-primary hover:underline">
                    Add Payment
                  </Link>
                  <Link to="/reports" className="text-primary hover:underline">
                    View Reports
                  </Link>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}