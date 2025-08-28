import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/image-upload";
import { useSuborganizers } from "@/hooks/useSuborganizers";
import { useCreatePayment } from "@/hooks/usePayments";
import { PAYMENT_PURPOSES, PAYMENT_MODES } from "@/types";
import { CreditCard, Upload, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AddPayment = () => {
  const navigate = useNavigate();
  const { data: suborganizers, isLoading: suborganizersLoading } = useSuborganizers();
  const createPaymentMutation = useCreatePayment();
  
  const [formData, setFormData] = useState({
    suborganizer_id: "",
    date: new Date().toISOString().split('T')[0],
    amount: "",
    purpose: "",
    payment_mode: "",
    notes: "",
    bill_receipt_url: "",
    payment_screenshot_url: ""
  });

  const resetForm = () => {
    setFormData({
      suborganizer_id: "",
      date: new Date().toISOString().split('T')[0],
      amount: "",
      purpose: "",
      payment_mode: "",
      notes: "",
      bill_receipt_url: "",
      payment_screenshot_url: ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.suborganizer_id || !formData.amount || !formData.purpose || !formData.payment_mode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    try {
      await createPaymentMutation.mutateAsync({
        ...formData,
        amount,
        bill_receipt_url: formData.bill_receipt_url || null,
        payment_screenshot_url: formData.payment_screenshot_url || null
      });
      resetForm();
      toast({
        title: "Success",
        description: "Payment recorded successfully!"
      });
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  if (suborganizersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedSuborganizer = suborganizers?.find(s => s.id === formData.suborganizer_id);
  const showDetachingOption = selectedSuborganizer?.crop_type === "Maize";

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div className="text-center">
        <div className="bg-gradient-to-r from-primary to-primary/90 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-card">
          <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground mx-auto mb-3" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground">Record Payment</h1>
          <p className="text-primary-foreground/80 text-sm sm:text-base">Log a new payment to suborganizer</p>
        </div>
      </div>

      <Card className="shadow-lg border">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl text-primary">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Suborganizer Selection */}
            <div className="space-y-2">
              <Label htmlFor="suborganizer">Suborganizer *</Label>
              <Select value={formData.suborganizer_id} onValueChange={(value) => setFormData(prev => ({ ...prev, suborganizer_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select suborganizer" />
                </SelectTrigger>
                <SelectContent>
                  {suborganizers?.map(suborganizer => (
                    <SelectItem key={suborganizer.id} value={suborganizer.id}>
                      {suborganizer.name} - {suborganizer.village} ({suborganizer.crop_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose *</Label>
                <Select value={formData.purpose} onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_PURPOSES.map(purpose => {
                      // Only show "Detaching" for Maize crops
                      if (purpose === "Detaching" && !showDetachingOption) {
                        return null;
                      }
                      return (
                        <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Mode */}
              <div className="space-y-2">
                <Label htmlFor="payment_mode">Payment Mode *</Label>
                <Select value={formData.payment_mode} onValueChange={(value) => setFormData(prev => ({ ...prev, payment_mode: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_MODES.map(mode => (
                      <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <ImageUpload
                label="Bill/Receipt Upload"
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, bill_receipt_url: url }))}
                onImageRemoved={() => setFormData(prev => ({ ...prev, bill_receipt_url: "" }))}
                currentImageUrl={formData.bill_receipt_url}
              />

              <ImageUpload
                label="Payment Screenshot (Optional)"
                onImageUploaded={(url) => setFormData(prev => ({ ...prev, payment_screenshot_url: url }))}
                onImageRemoved={() => setFormData(prev => ({ ...prev, payment_screenshot_url: "" }))}
                currentImageUrl={formData.payment_screenshot_url}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this payment..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={createPaymentMutation.isPending}
              >
                {createPaymentMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Record Payment
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!suborganizers?.length && (
        <Card className="shadow-card border-accent">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2 text-accent-foreground">No suborganizers available</h3>
            <p className="text-muted-foreground mb-4">You need to add suborganizers before recording payments</p>
            <Button variant="outline" onClick={() => navigate("/suborganizers")}>
              Add Suborganizers
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddPayment;