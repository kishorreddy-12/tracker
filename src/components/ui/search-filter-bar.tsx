import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Search, Filter, X } from "lucide-react";
import { DateRange } from "react-day-picker";

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  showDateFilter?: boolean;
  placeholder?: string;
}

export function SearchFilterBar({
  searchTerm,
  onSearchChange,
  filters = [],
  dateRange,
  onDateRangeChange,
  showDateFilter = false,
  placeholder = "Search..."
}: SearchFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFiltersCount = filters.filter(f => f.value).length + (dateRange?.from ? 1 : 0);

  const clearAllFilters = () => {
    filters.forEach(filter => filter.onChange(""));
    if (onDateRangeChange) {
      onDateRangeChange(undefined);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Button */}
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 relative">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-auto p-1 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Date Range Filter */}
              {showDateFilter && onDateRangeChange && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={onDateRangeChange}
                    placeholder="Select date range"
                  />
                </div>
              )}

              {/* Dynamic Filters */}
              {filters.map((filter, index) => (
                <div key={index} className="space-y-2">
                  <label className="text-sm font-medium">{filter.label}</label>
                  <Select value={filter.value} onValueChange={filter.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={`All ${filter.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All {filter.label.toLowerCase()}</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, index) => 
            filter.value ? (
              <Badge key={index} variant="secondary" className="gap-1">
                {filter.label}: {filter.options.find(o => o.value === filter.value)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => filter.onChange("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null
          )}
          
          {dateRange?.from && (
            <Badge variant="secondary" className="gap-1">
              Date: {dateRange.from.toLocaleDateString()}
              {dateRange.to && ` - ${dateRange.to.toLocaleDateString()}`}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onDateRangeChange?.(undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}