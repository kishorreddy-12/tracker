import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { ExportDialog } from "@/components/reports/ExportDialog";
import { usePaymentStats, usePayments } from "@/hooks/usePayments";
import { useSuborganizers } from "@/hooks/useSuborganizers";
import { 
  BarChart3, 
  Download, 
  PieChart, 
  TrendingUp,
  Loader2,
  Users,
  CreditCard,
  DollarSign
} from "lucide-react";
import { useMemo, useState } from "react";
import { isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

const Reports = () => {
  const { data: stats, isLoading: statsLoading } = usePaymentStats();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: suborganizers, isLoading: suborganizersLoading } = useSuborganizers();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Filter payments by date range
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    if (!dateRange?.from || !dateRange?.to) return payments;

    return payments.filter(payment => 
      isWithinInterval(new Date(payment.date), {
        start: dateRange.from!,
        end: dateRange.to!
      })
    );
  }, [payments, dateRange]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    if (!filteredPayments) return null;

    const totalAmount = filteredPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const totalPayments = filteredPayments.length;
    
    // Group by purpose
    const purposeStats = filteredPayments.reduce((acc, payment) => {
      const purpose = payment.purpose;
      acc[purpose] = (acc[purpose] || 0) + Number(payment.amount);
      return acc;
    }, {} as Record<string, number>);

    // Group by payment mode
    const modeStats = filteredPayments.reduce((acc, payment) => {
      const mode = payment.payment_mode;
      acc[mode] = (acc[mode] || 0) + Number(payment.amount);
      return acc;
    }, {} as Record<string, number>);

    // Count unique suborganizers
    const uniqueSuborganizers = new Set(filteredPayments.map(p => p.suborganizer_id)).size;

    return {
      totalAmount,
      totalPayments,
      uniqueSuborganizers,
      purposeStats,
      modeStats
    };
  }, [filteredPayments]);

  const suborganizerStats = useMemo(() => {
    if (!filteredPayments || !suborganizers) return [];

    const suborganizerTotals = filteredPayments.reduce((acc, payment) => {
      const suborganizerId = payment.suborganizer_id;
      const suborganizer = suborganizers.find(s => s.id === suborganizerId);
      
      if (suborganizer) {
        const key = suborganizerId;
        if (!acc[key]) {
          acc[key] = {
            name: suborganizer.name,
            village: suborganizer.village,
            crop_type: suborganizer.crop_type,
            totalAmount: 0,
            paymentCount: 0
          };
        }
        acc[key].totalAmount += Number(payment.amount);
        acc[key].paymentCount += 1;
      }
      return acc;
    }, {} as Record<string, {
      name: string;
      village: string;
      crop_type: string;
      totalAmount: number;
      paymentCount: number;
    }>);

    return Object.values(suborganizerTotals).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredPayments, suborganizers]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (statsLoading || paymentsLoading || suborganizersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const dateRangeText = dateRange?.from && dateRange?.to 
    ? `_${dateRange.from.toISOString().split('T')[0]}_to_${dateRange.to.toISOString().split('T')[0]}`
    : '';

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary-glow rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground mb-2">Reports & Analytics</h1>
            <p className="text-primary-foreground/80">Comprehensive insights into your payment activities</p>
          </div>
          <ExportDialog 
            payments={filteredPayments} 
            dateRangeText={dateRangeText}
          />
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-primary">Filter by Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              placeholder="All time"
            />
          </div>
          {dateRange?.from && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing data from {dateRange.from.toLocaleDateString()} 
              {dateRange.to && ` to ${dateRange.to.toLocaleDateString()}`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/80">Total Amount</CardTitle>
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatCurrency(filteredStats?.totalAmount || 0)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats?.totalPayments || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Suborganizers</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStats?.uniqueSuborganizers || 0}</div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Payment</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((filteredStats?.totalAmount || 0) / Math.max(filteredStats?.totalPayments || 1, 1))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Purposes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <PieChart className="h-5 w-5" />
              Payment by Purpose
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStats?.purposeStats && Object.keys(filteredStats.purposeStats).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(filteredStats.purposeStats)
                  .sort(([,a], [,b]) => b - a)
                  .map(([purpose, amount]) => {
                    const percentage = ((amount / (filteredStats.totalAmount || 1)) * 100).toFixed(1);
                    return (
                      <div key={purpose} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{purpose}</span>
                          <span className="text-sm text-muted-foreground">{percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-right text-sm font-semibold">
                          {formatCurrency(amount)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-muted-foreground">No payment data available</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Modes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BarChart3 className="h-5 w-5" />
              Payment by Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStats?.modeStats && Object.keys(filteredStats.modeStats).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(filteredStats.modeStats)
                  .sort(([,a], [,b]) => b - a)
                  .map(([mode, amount]) => {
                    const percentage = ((amount / (filteredStats.totalAmount || 1)) * 100).toFixed(1);
                    return (
                      <div key={mode} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{mode}</span>
                          <span className="text-sm text-muted-foreground">{percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-accent h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-right text-sm font-semibold">
                          {formatCurrency(amount)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-muted-foreground">No payment data available</p>
            )}
          </CardContent>
        </Card>

        {/* Suborganizer Performance */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Users className="h-5 w-5" />
              Suborganizer Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suborganizerStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Name</th>
                      <th className="text-left py-2 font-medium">Village</th>
                      <th className="text-left py-2 font-medium">Crop</th>
                      <th className="text-right py-2 font-medium">Payments</th>
                      <th className="text-right py-2 font-medium">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suborganizerStats.map((suborganizer, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 font-medium">{suborganizer.name}</td>
                        <td className="py-3 text-muted-foreground">{suborganizer.village}</td>
                        <td className="py-3 text-muted-foreground">{suborganizer.crop_type}</td>
                        <td className="py-3 text-right">{suborganizer.paymentCount}</td>
                        <td className="py-3 text-right font-semibold">
                          {formatCurrency(suborganizer.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;