import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Search, Coffee, Utensils, Trees, Fuel, ShoppingCart, Film } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { locationSchema, type LocationRequest, type MidpointResponse, PLACE_TYPES, type PlaceType } from "@shared/schema";

const FILTER_ICONS = {
  cafe: Coffee,
  restaurant: Utensils,
  park: Trees,
  gas_station: Fuel,
  shopping_mall: ShoppingCart,
  movie_theater: Film
} as const;

interface LocationFormProps {
  onSearch: (data: LocationRequest) => void;
  onResults: (data: MidpointResponse) => void;
}

export default function LocationForm({ onSearch, onResults }: LocationFormProps) {
  const [selectedFilters, setSelectedFilters] = useState<PlaceType[]>([]);
  const { toast } = useToast();

  const form = useForm<LocationRequest>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      location1: "",
      location2: "",
      filters: []
    }
  });

  const searchMutation = useMutation({
    mutationFn: async (data: LocationRequest) => {
      const response = await apiRequest("POST", "/api/midpoint", data);
      return response.json() as Promise<MidpointResponse>;
    },
    onSuccess: (data) => {
      onResults(data);
      toast({
        title: "Success!",
        description: `Found ${data.places.length} places near the midpoint.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to find midpoint",
        variant: "destructive",
      });
    }
  });

  const toggleFilter = (filterType: PlaceType) => {
    setSelectedFilters(prev => {
      const newFilters = prev.includes(filterType)
        ? prev.filter(f => f !== filterType)
        : [...prev, filterType];
      
      form.setValue("filters", newFilters);
      return newFilters;
    });
  };

  const onSubmit = (data: LocationRequest) => {
    const searchData = {
      ...data,
      filters: selectedFilters
    };
    
    onSearch(searchData);
    searchMutation.mutate(searchData);
  };

  return (
    <div className="bg-surface rounded-xl shadow-lg p-6 sticky top-8">
      <h3 className="text-xl font-semibold mb-6 text-secondary">Enter Locations</h3>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Location Inputs */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="location1"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="First Location"
                      data-testid="input-location1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location2"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FloatingInput
                      label="Second Location"
                      data-testid="input-location2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Filter Categories */}
          <div>
            <h4 className="text-sm font-semibold text-secondary mb-3">Filter by Type</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PLACE_TYPES).map(([key, { name }]) => {
                const filterType = key as PlaceType;
                const IconComponent = FILTER_ICONS[filterType];
                const isSelected = selectedFilters.includes(filterType);
                
                return (
                  <Button
                    key={filterType}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-white border-primary hover:bg-blue-700"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                    }`}
                    onClick={() => toggleFilter(filterType)}
                    data-testid={`filter-${filterType}`}
                  >
                    <IconComponent className="mr-1" size={14} />
                    {name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors focus:ring-2 focus:ring-accent focus:ring-offset-2"
            disabled={searchMutation.isPending}
            data-testid="button-search"
          >
            {searchMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2" size={16} />
                Find Midpoint Places
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
