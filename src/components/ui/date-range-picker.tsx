import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({ 
  dateRange, 
  onDateRangeChange, 
  placeholder = "Select date range" 
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClear = () => {
    onDateRangeChange(undefined);
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder;
    if (!range.to) return format(range.from, "MMM d, yyyy");
    return `${format(range.from, "MMM d, yyyy")} - ${format(range.to, "MMM d, yyyy")}`;
  };

  return (
    <div className="space-y-2">
      <Label>Date Range</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Select Date Range</h4>
              {dateRange?.from && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={onDateRangeChange}
              numberOfMonths={2}
              className="rounded-md border"
            />
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const thirtyDaysAgo = new Date(today);
                  thirtyDaysAgo.setDate(today.getDate() - 30);
                  onDateRangeChange({ from: thirtyDaysAgo, to: today });
                }}
              >
                Last 30 days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  onDateRangeChange({ from: startOfMonth, to: today });
                }}
              >
                This month
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Simple date range inputs for mobile/fallback
export function SimpleDateRangeInputs({ 
  dateRange, 
  onDateRangeChange 
}: DateRangePickerProps) {
  const handleFromChange = (date: string) => {
    const fromDate = date ? new Date(date) : undefined;
    onDateRangeChange({
      from: fromDate,
      to: dateRange?.to
    });
  };

  const handleToChange = (date: string) => {
    const toDate = date ? new Date(date) : undefined;
    onDateRangeChange({
      from: dateRange?.from,
      to: toDate
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label>From Date</Label>
        <Input
          type="date"
          value={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
          onChange={(e) => handleFromChange(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>To Date</Label>
        <Input
          type="date"
          value={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
          onChange={(e) => handleToChange(e.target.value)}
        />
      </div>
    </div>
  );
}