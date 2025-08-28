import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { usePayments } from "@/hooks/usePayments";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  CreditCard, 
  Calendar, 
  User, 
  MapPin, 
  Banknote,
  Loader2,
  Search,
  Filter,
  Image as ImageIcon,
  FileText,
  RefreshCw
} from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import { DateRange } from "react-day-picker";

const Payments = () => {
  const queryClient = useQueryClient();
  const { data: payments, isLoading, error } = usePayments();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPurpose, setFilterPurpose] = useState("all");
  const [filterMode, setFilterMode] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const filteredPayments = useMemo(() => {
    if (!payments || !Array.isArray(payments)) return [];

    return payments.filter(payment => {
      if (!payment) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        payment.suborganizer?.name?.toLowerCase().includes(searchLower) ||
        payment.suborganizer?.village?.toLowerCase().includes(searchLower) ||
        payment.notes?.toLowerCase().includes(searchLower);

      const matchesPurpose = !filterPurpose || filterPurpose === "all" || payment.purpose === filterPurpose;
      const matchesMode = !filterMode || filterMode === "all" || payment.payment_mode === filterMode;

      // Date range filtering with error handling
      let matchesDateRange = true;
      if (dateRange?.from && dateRange?.to && payment.date) {
        try {
          matchesDateRange = isWithinInterval(new Date(payment.date), {
            start: dateRange.from,
            end: dateRange.to
          });
        } catch (error) {
          console.warn('Date filtering error:', error);
          matchesDateRange = true; // Include payment if date parsing fails
        }
      }

      return matchesSearch && matchesPurpose && matchesMode && matchesDateRange;
    });
  }, [payments, searchTerm, filterPurpose, filterMode, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentModeColor = (mode: string) => {
    const colors = {
      'Cash': 'bg-green-100 text-green-800',
      'Cheque': 'bg-blue-100 text-blue-800', 
      'PhonePe': 'bg-purple-100 text-purple-800',
      'Google Pay': 'bg-yellow-100 text-yellow-800',
      'Bank Transfer': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[mode as keyof typeof colors] || colors.Other;
  };

  const getPurposeColor = (purpose: string) => {
    const colors = {
      'Pesticides': 'bg-red-100 text-red-800',
      'Sowing Advance': 'bg-green-100 text-green-800',
      'Labor Cost': 'bg-blue-100 text-blue-800',
      'Rouging': 'bg-yellow-100 text-yellow-800',
      'Detaching': 'bg-purple-100 text-purple-800',
      'Seed Lifting': 'bg-indigo-100 text-indigo-800',
      'Gunny Bags': 'bg-pink-100 text-pink-800',
      'Transportation': 'bg-orange-100 text-orange-800'
    };
    return colors[purpose as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };



  const totalAmount = filteredPayments.reduce((sum, payment) => {
    const amount = Number(payment?.amount) || 0;
    return sum + amount;
  }, 0);
  
  const uniquePurposes = [...new Set(payments?.filter(p => p?.purpose).map(p => p.purpose) || [])];
  const uniqueModes = [...new Set(payments?.filter(p => p?.payment_mode).map(p => p.payment_mode) || [])];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-destructive mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Unable to load payments</h3>
            <p className="text-muted-foreground mb-4">
              {error.message || "There was an error loading the payments data."}
            </p>
            <div className="space-x-2">
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["payments"] })}>
                Retry
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/90 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">Payment History</h1>
              <p className="text-primary-foreground/80 text-sm sm:text-base truncate">
                {filteredPayments.length} payments • Total: {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["payments"] })}
            disabled={isLoading}
            className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/20 flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, village, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <DateRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              placeholder="All dates"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Purpose</label>
              <Select value={filterPurpose} onValueChange={setFilterPurpose}>
                <SelectTrigger>
                  <SelectValue placeholder="All purposes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All purposes</SelectItem>
                  {uniquePurposes.map(purpose => (
                    <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Mode</label>
              <Select value={filterMode} onValueChange={setFilterMode}>
                <SelectTrigger>
                  <SelectValue placeholder="All modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modes</SelectItem>
                  {uniqueModes.map(mode => (
                    <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear filters button */}
          {(searchTerm || (filterPurpose && filterPurpose !== "all") || (filterMode && filterMode !== "all") || dateRange?.from) && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setFilterPurpose("all");
                  setFilterMode("all");
                  setDateRange(undefined);
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="shadow-lg border hover:shadow-xl transition-all duration-200">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                      {formatCurrency(Number(payment.amount))}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground text-sm">
                      <div className="flex items-center gap-1 min-w-0">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{payment.suborganizer?.name}</span>
                      </div>
                      <div className="flex items-center gap-1 min-w-0">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{payment.suborganizer?.village}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>{format(new Date(payment.date), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className={getPurposeColor(payment.purpose)}>
                      {payment.purpose}
                    </Badge>
                    <Badge className={getPaymentModeColor(payment.payment_mode)}>
                      <Banknote className="h-3 w-3 mr-1" />
                      {payment.payment_mode}
                    </Badge>
                  </div>

                  {payment.notes && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {payment.notes}
                    </p>
                  )}

                  {/* Image attachments */}
                  {(payment.bill_receipt_url || payment.payment_screenshot_url) && (
                    <div className="flex gap-2 mt-3">
                      {payment.bill_receipt_url && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <FileText className="h-3 w-3" />
                              Bill/Receipt
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Bill/Receipt</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center">
                              <img
                                src={payment.bill_receipt_url}
                                alt="Bill/Receipt"
                                className="max-w-full max-h-96 object-contain rounded-lg"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {payment.payment_screenshot_url && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                              <ImageIcon className="h-3 w-3" />
                              Screenshot
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Screenshot</DialogTitle>
                            </DialogHeader>
                            <div className="flex justify-center">
                              <img
                                src={payment.payment_screenshot_url}
                                alt="Payment Screenshot"
                                className="max-w-full max-h-96 object-contain rounded-lg"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}

        {!filteredPayments.length && (
          <Card className="shadow-lg border">
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || (filterPurpose && filterPurpose !== "all") || (filterMode && filterMode !== "all") || dateRange?.from ? "No matching payments found" : "No payments recorded yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || (filterPurpose && filterPurpose !== "all") || (filterMode && filterMode !== "all") || dateRange?.from
                  ? "Try adjusting your search or filters"
                  : "Start by recording your first payment"
                }
              </p>
              {!(searchTerm || (filterPurpose && filterPurpose !== "all") || (filterMode && filterMode !== "all") || dateRange?.from) && (
                <Button onClick={() => window.location.href = '/add-payment'} className="mt-2">
                  Add First Payment
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton href="/add-payment" />
    </div>
  );
};

export default Payments;