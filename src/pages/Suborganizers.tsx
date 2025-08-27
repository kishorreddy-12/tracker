import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSuborganizers, useCreateSuborganizer, useUpdateSuborganizer, useDeleteSuborganizer } from "@/hooks/useSuborganizers";
import { usePaymentStats } from "@/hooks/usePayments";
import { SuborganizerCard } from "@/components/suborganizers/SuborganizerCard";
import { Suborganizer, CROP_TYPES } from "@/types";
import { Plus, Loader2, Users, IndianRupee, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Suborganizers = () => {
  const { data: suborganizers, isLoading } = useSuborganizers();
  const { data: paymentStats } = usePaymentStats();
  const createMutation = useCreateSuborganizer();
  const updateMutation = useUpdateSuborganizer();
  const deleteMutation = useDeleteSuborganizer();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSuborganizer, setEditingSuborganizer] = useState<Suborganizer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    village: "",
    crop_type: ""
  });

  const resetForm = () => {
    setFormData({ name: "", phone: "", village: "", crop_type: "" });
    setEditingSuborganizer(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.village || !formData.crop_type) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingSuborganizer) {
        await updateMutation.mutateAsync({
          id: editingSuborganizer.id,
          ...formData
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      resetForm();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleEdit = (suborganizer: Suborganizer) => {
    setEditingSuborganizer(suborganizer);
    setFormData({
      name: suborganizer.name,
      phone: suborganizer.phone,
      village: suborganizer.village,
      crop_type: suborganizer.crop_type
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this suborganizer?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (isLoading) {
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
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Suborganizers</h1>
            <p className="text-muted-foreground">Manage your suborganizer network and view payment history</p>
          </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Suborganizer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSuborganizer ? "Edit Suborganizer" : "Add New Suborganizer"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="village">Village</Label>
                <Input
                  id="village"
                  value={formData.village}
                  onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                  placeholder="Enter village name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="crop_type">Crop Type</Label>
                <Select value={formData.crop_type} onValueChange={(value) => setFormData(prev => ({ ...prev, crop_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CROP_TYPES.map(crop => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingSuborganizer ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>

        {/* Quick Stats */}
        {paymentStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Suborganizers</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {suborganizers?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payments Made</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(paymentStats.totalAmount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {paymentStats.totalPayments}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suborganizers?.map((suborganizer) => (
          <SuborganizerCard
            key={suborganizer.id}
            suborganizer={suborganizer}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        ))}
        
        {!suborganizers?.length && (
          <Card className="col-span-full shadow-card">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No suborganizers yet</h3>
              <p className="text-muted-foreground mb-4">Start by adding your first suborganizer</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Suborganizer
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Suborganizers;