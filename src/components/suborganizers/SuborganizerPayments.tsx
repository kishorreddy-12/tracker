import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePaymentsBySuborganizer, useSuborganizerPaymentStats } from "@/hooks/usePayments";
import { Suborganizer } from "@/types";
import { 
  CreditCard, 
  Calendar, 
  IndianRupee, 
  FileText, 
  Loader2,
  Eye,
  TrendingUp,
  Receipt
} from "lucide-react";
import { format } from "date-fns";

interface SuborganizerPaymentsProps {
  suborganizer: Suborganizer;
}

export function SuborganizerPayments({ suborganizer }: SuborganizerPaymentsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: payments, isLoading: paymentsLoading } = usePaymentsBySuborganizer(suborganizer.id);
  const { data: stats, isLoading: statsLoading } = useSuborganizerPaymentStats(suborganizer.id);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      'Cash': 'bg-green-100 text-green-800',
      'Cheque': 'bg-blue-100 text-blue-800',
      'PhonePe': 'bg-purple-100 text-purple-800',
      'Google Pay': 'bg-yellow-100 text-yellow-800',
      'Bank Transfer': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[mode] || colors['Other'];
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          View Payments
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History - {suborganizer.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Payment Stats Summary */}
          {statsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Paid</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(stats.totalAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Payments</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {stats.totalPayments}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Payment</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {stats.latestPaymentDate 
                          ? format(new Date(stats.latestPaymentDate), 'MMM d, yyyy')
                          : 'No payments'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Breakdown */}
          {stats && Object.keys(stats.purposeStats).length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Payment Breakdown by Purpose
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(stats.purposeStats)
                    .sort(([,a], [,b]) => b - a)
                    .map(([purpose, amount]) => (
                    <div key={purpose} className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium">{purpose}</p>
                      <p className="text-lg font-semibold text-primary">
                        {formatCurrency(amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment History */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {paymentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getPaymentModeColor(payment.payment_mode)}>
                                {payment.payment_mode}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(payment.date), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <p className="font-medium">{payment.purpose}</p>
                            {payment.notes && (
                              <p className="text-sm text-muted-foreground">{payment.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-primary">
                              {formatCurrency(payment.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No payments recorded yet</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}