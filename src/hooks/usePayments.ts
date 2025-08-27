import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useOffline } from "@/hooks/useOffline";

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          suborganizer:suborganizers(name, village)
        `)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    }
  });
}

export function usePaymentsBySuborganizer(suborganizerId: string) {
  return useQuery({
    queryKey: ["payments", "suborganizer", suborganizerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          suborganizer:suborganizers(name, village)
        `)
        .eq("suborganizer_id", suborganizerId)
        .order("date", { ascending: false });
      
      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!suborganizerId
  });
}

export function useSuborganizerPaymentStats(suborganizerId: string) {
  return useQuery({
    queryKey: ["payment-stats", "suborganizer", suborganizerId],
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from("payments")
        .select("amount, purpose, payment_mode, date")
        .eq("suborganizer_id", suborganizerId);
      
      if (error) throw error;

      const totalAmount = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      const totalPayments = payments?.length || 0;
      
      // Group by purpose
      const purposeStats = payments?.reduce((acc, payment) => {
        const purpose = payment.purpose;
        acc[purpose] = (acc[purpose] || 0) + Number(payment.amount);
        return acc;
      }, {} as Record<string, number>) || {};

      // Group by payment mode
      const modeStats = payments?.reduce((acc, payment) => {
        const mode = payment.payment_mode;
        acc[mode] = (acc[mode] || 0) + Number(payment.amount);
        return acc;
      }, {} as Record<string, number>) || {};

      // Get latest payment date
      const latestPayment = payments?.length > 0 ? 
        payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

      return {
        totalAmount,
        totalPayments,
        purposeStats,
        modeStats,
        latestPaymentDate: latestPayment?.date
      };
    },
    enabled: !!suborganizerId
  });
}

export function usePaymentStats() {
  return useQuery({
    queryKey: ["payment-stats"],
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from("payments")
        .select("amount, purpose, payment_mode, suborganizer_id");
      
      if (error) throw error;

      const totalAmount = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
      const totalPayments = payments?.length || 0;
      
      // Group by purpose
      const purposeStats = payments?.reduce((acc, payment) => {
        const purpose = payment.purpose;
        acc[purpose] = (acc[purpose] || 0) + Number(payment.amount);
        return acc;
      }, {} as Record<string, number>) || {};

      // Group by payment mode
      const modeStats = payments?.reduce((acc, payment) => {
        const mode = payment.payment_mode;
        acc[mode] = (acc[mode] || 0) + Number(payment.amount);
        return acc;
      }, {} as Record<string, number>) || {};

      // Count unique suborganizers
      const uniqueSuborganizers = new Set(payments?.map(p => p.suborganizer_id)).size;

      return {
        totalAmount,
        totalPayments,
        uniqueSuborganizers,
        purposeStats,
        modeStats
      };
    }
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { isOnline, saveOffline } = useOffline();

  return useMutation({
    mutationFn: async (payment: Omit<Payment, "id" | "created_at" | "updated_at">) => {
      // If offline, save to local storage
      if (!isOnline) {
        const offlinePayment = {
          ...payment,
          id: `temp_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await saveOffline('payment', offlinePayment);
        return offlinePayment;
      }

      // If online, save to Supabase
      const { data, error } = await supabase
        .from("payments")
        .insert([payment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
      
      if (isOnline) {
        toast({
          title: "Success",
          description: "Payment recorded successfully"
        });
      } else {
        toast({
          title: "Saved Offline",
          description: "Payment saved locally. Will sync when connection is restored."
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: isOnline ? "Failed to record payment" : "Failed to save payment offline",
        variant: "destructive"
      });
    }
  });
}