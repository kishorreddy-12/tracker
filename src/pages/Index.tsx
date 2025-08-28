import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SpendingChart } from "@/components/dashboard/SpendingChart";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { usePaymentStats } from "@/hooks/usePayments";
import { useSuborganizers } from "@/hooks/useSuborganizers";
import { 
  DollarSign, 
  CreditCard, 
  Users, 
  TrendingUp,
  Loader2 
} from "lucide-react";

const Index = () => {
  const { data: stats, isLoading: statsLoading } = usePaymentStats();
  const { data: suborganizers, isLoading: suborganizersLoading } = useSuborganizers();

  if (statsLoading || suborganizersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-primary to-primary-glow rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-card">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
          Welcome back, Srinivas! 🌱
        </h1>
        <p className="text-primary-foreground/80 text-sm sm:text-base md:text-lg">
          Here's an overview of your seed organization activities
        </p>
      </div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Total Season Amount"
          value={formatCurrency(stats?.totalAmount || 0)}
          icon={DollarSign}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white"
        />
        <StatsCard
          title="Total Payments"
          value={stats?.totalPayments?.toString() || "0"}
          icon={CreditCard}
        />
        <StatsCard
          title="Active Suborganizers"
          value={suborganizers?.length?.toString() || "0"}
          icon={Users}
        />
        <StatsCard
          title="Average Payment"
          value={formatCurrency((stats?.totalAmount || 0) / Math.max(stats?.totalPayments || 1, 1))}
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Analytics Charts */}
      <SpendingChart />

      {/* Recent Activity Summary - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Payment Purposes */}
        <div className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-card">
          <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">Payment Breakdown</h3>
          {stats?.purposeStats && Object.keys(stats.purposeStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.purposeStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([purpose, amount]) => (
                <div key={purpose} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{purpose}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No payments recorded yet</p>
          )}
        </div>

        {/* Payment Modes */}
        <div className="bg-card rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-card">
          <h3 className="text-base sm:text-lg font-semibold text-primary mb-3 sm:mb-4">Payment Methods</h3>
          {stats?.modeStats && Object.keys(stats.modeStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.modeStats)
                .sort(([,a], [,b]) => b - a)
                .map(([mode, amount]) => (
                <div key={mode} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{mode}</span>
                  <span className="font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No payments recorded yet</p>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton href="/add-payment" />
    </div>
  );
};

export default Index;
