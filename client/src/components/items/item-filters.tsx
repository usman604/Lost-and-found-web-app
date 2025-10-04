import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, LOCATIONS } from "@/lib/constants";

interface ItemFiltersProps {
  filters: {
    category: string;
    location: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function ItemFilters({ filters, onFiltersChange }: ItemFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search" className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search items..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="mt-2"
              data-testid="filter-search"
              style={{ 
                backgroundColor: "hsl(210, 20%, 98%)",
                borderColor: "hsl(214, 32%, 91%)"
              }}
            />
          </div>

          <div>
            <Label className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
              Category
            </Label>
            <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
              <SelectTrigger 
                className="mt-2"
                data-testid="filter-category"
                style={{ 
                  backgroundColor: "hsl(210, 20%, 98%)",
                  borderColor: "hsl(214, 32%, 91%)"
                }}
              >
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
              Location
            </Label>
            <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
              <SelectTrigger 
                className="mt-2"
                data-testid="filter-location"
                style={{ 
                  backgroundColor: "hsl(210, 20%, 98%)",
                  borderColor: "hsl(214, 32%, 91%)"
                }}
              >
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Locations</SelectItem>
                {LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium" style={{ color: "hsl(222, 47%, 11%)" }}>
              Date Range
            </Label>
            <Select defaultValue="7">
              <SelectTrigger 
                className="mt-2"
                data-testid="filter-date-range"
                style={{ 
                  backgroundColor: "hsl(210, 20%, 98%)",
                  borderColor: "hsl(214, 32%, 91%)"
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
