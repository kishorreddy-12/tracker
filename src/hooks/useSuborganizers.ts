import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Suborganizer } from "@/types";
import { toast } from "@/hooks/use-toast";
import { useOffline } from "@/hooks/useOffline";

export function useSuborganizers() {
  return useQuery({
    queryKey: ["suborganizers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suborganizers")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Suborganizer[];
    }
  });
}

export function useCreateSuborganizer() {
  const queryClient = useQueryClient();
  const { isOnline, saveOffline } = useOffline();

  return useMutation({
    mutationFn: async (suborganizer: Omit<Suborganizer, "id" | "created_at" | "updated_at">) => {
      // If offline, save to local storage
      if (!isOnline) {
        const offlineSuborganizer = {
          ...suborganizer,
          id: `temp_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await saveOffline('suborganizer', offlineSuborganizer);
        return offlineSuborganizer;
      }

      // If online, save to Supabase
      const { data, error } = await supabase
        .from("suborganizers")
        .insert([suborganizer])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suborganizers"] });
      
      if (isOnline) {
        toast({
          title: "Success",
          description: "Suborganizer created successfully"
        });
      } else {
        toast({
          title: "Saved Offline",
          description: "Suborganizer saved locally. Will sync when connection is restored."
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: isOnline ? "Failed to create suborganizer" : "Failed to save suborganizer offline",
        variant: "destructive"
      });
    }
  });
}

export function useUpdateSuborganizer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Suborganizer> & { id: string }) => {
      const { data, error } = await supabase
        .from("suborganizers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suborganizers"] });
      toast({
        title: "Success",
        description: "Suborganizer updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update suborganizer",
        variant: "destructive"
      });
    }
  });
}

export function useDeleteSuborganizer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("suborganizers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suborganizers"] });
      toast({
        title: "Success",
        description: "Suborganizer deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete suborganizer",
        variant: "destructive"
      });
    }
  });
}