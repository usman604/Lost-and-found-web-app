import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/navbar";
import ItemCard from "@/components/items/item-card";
import ItemFilters from "@/components/items/item-filters";
import { getLostItems } from "@/api/items";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default function LostItems() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    search: "",
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['/api/lost', filters],
    queryFn: () => getLostItems(filters),
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "hsl(210, 20%, 98%)" }}>
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>Lost Items</h1>
            <p style={{ color: "hsl(215, 16%, 47%)" }}>Browse items reported as lost by students</p>
          </div>
          <Button 
            onClick={() => setLocation("/report/lost")} 
            className="mt-4 md:mt-0"
            data-testid="button-report-lost"
          >
            <Plus className="mr-2 h-4 w-4" />
            Report Lost Item
          </Button>
        </div>

        <ItemFilters filters={filters} onFiltersChange={setFilters} />

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>
            Showing <span className="font-medium" style={{ color: "hsl(222, 47%, 11%)" }} data-testid="items-count">{items.length}</span> lost items
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm" style={{ color: "hsl(215, 16%, 47%)" }}>Sort by:</span>
            <select className="text-sm border rounded-md px-2 py-1" style={{ 
              backgroundColor: "hsl(210, 20%, 98%)",
              borderColor: "hsl(214, 32%, 91%)"
            }}>
              <option>Most Recent</option>
              <option>Oldest First</option>
              <option>Location</option>
            </select>
          </div>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg h-48 mb-4"></div>
                <div className="bg-muted rounded h-4 mb-2"></div>
                <div className="bg-muted rounded h-3 w-2/3"></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(222, 47%, 11%)" }}>No Items Found</h3>
            <p style={{ color: "hsl(215, 16%, 47%)" }}>Try adjusting your search filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} type="lost" showUser />
            ))}
          </div>
        )}

        {/* Pagination */}
        {items.length > 0 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button variant="outline" size="sm" data-testid="pagination-prev">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" data-testid="pagination-current">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm" data-testid="pagination-next">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
