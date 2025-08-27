import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, FileText, Table, Loader2 } from "lucide-react";
import { Payment } from "@/types";
import { toast } from "@/hooks/use-toast";

interface ExportDialogProps {
  payments: Payment[];
  dateRangeText?: string;
}

export function ExportDialog({ payments, dateRangeText = "" }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [includeFields, setIncludeFields] = useState({
    date: true,
    suborganizer: true,
    village: true,
    amount: true,
    purpose: true,
    paymentMode: true,
    notes: true
  });

  const handleFieldChange = (field: keyof typeof includeFields, checked: boolean) => {
    setIncludeFields(prev => ({ ...prev, [field]: checked }));
  };

  const exportToCSV = () => {
    const headers = [];
    const fieldMap = {
      date: 'Date',
      suborganizer: 'Suborganizer',
      village: 'Village',
      amount: 'Amount',
      purpose: 'Purpose',
      paymentMode: 'Payment Mode',
      notes: 'Notes'
    };

    // Build headers based on selected fields
    Object.entries(includeFields).forEach(([field, include]) => {
      if (include) {
        headers.push(fieldMap[field as keyof typeof fieldMap]);
      }
    });

    // Build data rows
    const rows = payments.map(payment => {
      const row = [];
      if (includeFields.date) row.push(payment.date);
      if (includeFields.suborganizer) row.push(payment.suborganizer?.name || '');
      if (includeFields.village) row.push(payment.suborganizer?.village || '');
      if (includeFields.amount) row.push(payment.amount.toString());
      if (includeFields.purpose) row.push(payment.purpose);
      if (includeFields.paymentMode) row.push(payment.payment_mode);
      if (includeFields.notes) row.push(payment.notes || '');
      return row.map(field => `"${field}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `seed-organizer-payments${dateRangeText}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const filteredData = payments.map(payment => {
      const filtered: any = {};
      if (includeFields.date) filtered.date = payment.date;
      if (includeFields.suborganizer) filtered.suborganizer = payment.suborganizer?.name || '';
      if (includeFields.village) filtered.village = payment.suborganizer?.village || '';
      if (includeFields.amount) filtered.amount = payment.amount;
      if (includeFields.purpose) filtered.purpose = payment.purpose;
      if (includeFields.paymentMode) filtered.payment_mode = payment.payment_mode;
      if (includeFields.notes) filtered.notes = payment.notes || '';
      return filtered;
    });

    const jsonContent = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `seed-organizer-payments${dateRangeText}-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (exportFormat === "csv") {
        exportToCSV();
      } else {
        exportToJSON();
      }
      
      toast({
        title: "Export Successful",
        description: `Data exported as ${exportFormat.toUpperCase()} file`
      });
      
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Payment Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={exportFormat} onValueChange={(value: "csv" | "json") => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    CSV (Excel Compatible)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON (Data Format)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Field Selection */}
          <div className="space-y-3">
            <Label>Include Fields</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(includeFields).map(([field, checked]) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox
                    id={field}
                    checked={checked}
                    onCheckedChange={(checked) => handleFieldChange(field as keyof typeof includeFields, !!checked)}
                  />
                  <Label htmlFor={field} className="text-sm font-normal capitalize">
                    {field === 'paymentMode' ? 'Payment Mode' : field}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Exporting {payments.length} payment records
              {dateRangeText && ` for the selected date range`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              onClick={handleExport} 
              disabled={isExporting || Object.values(includeFields).every(v => !v)}
              className="flex-1"
            >
              {isExporting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Export {exportFormat.toUpperCase()}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}