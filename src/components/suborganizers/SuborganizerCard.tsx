import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSuborganizerPaymentStats } from "@/hooks/usePayments";
import { SuborganizerPayments } from "./SuborganizerPayments";
import { Suborganizer } from "@/types";
import { Edit, Trash2, Phone, MapPin, Wheat, IndianRupee, CreditCard, Loader2 } from "lucide-react";

interface SuborganizerCardProps {
  suborganizer: Suborganizer;
  onEdit: (suborganizer: Suborganizer) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function SuborganizerCard({ suborganizer, onEdit, onDelete, isDeleting }: SuborganizerCardProps) {
  const { data: stats, isLoading: statsLoading } = useSuborganizerPaymentStats(suborganizer.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="shadow-card hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary flex items-center justify-between">
          {suborganizer.name}
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(suborganizer)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(suborganizer.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{suborganizer.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{suborganizer.village}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wheat className="h-4 w-4" />
            <span>{suborganizer.crop_type}</span>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="pt-3 border-t">
          {statsLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : stats ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IndianRupee className="h-4 w-4" />
                  <span>Total Paid:</span>
                </div>
                <span className="font-semibold text-primary">
                  {formatCurrency(stats.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Payments:</span>
                </div>
                <Badge variant="secondary">
                  {stats.totalPayments}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-2">
              No payment data
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          <SuborganizerPayments suborganizer={suborganizer} />
        </div>
      </CardContent>
    </Card>
  );
}