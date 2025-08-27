import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Sprout } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100">
      <Card className="w-full max-w-md text-center shadow-card">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-primary to-primary-glow rounded-full">
              <Sprout className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-6xl font-bold text-muted-foreground mb-4">404</CardTitle>
          <h1 className="text-2xl font-bold text-primary">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button asChild variant="default" className="min-h-[44px]">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go Home
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
          
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">Quick Navigation:</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link to="/suborganizers" className="text-primary hover:underline">
                Suborganizers
              </Link>
              <Link to="/payments" className="text-primary hover:underline">
                Payments
              </Link>
              <Link to="/add-payment" className="text-primary hover:underline">
                Add Payment
              </Link>
              <Link to="/reports" className="text-primary hover:underline">
                Reports
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
