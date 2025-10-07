import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Search,
  Coffee,
  Utensils,
  Trees,
  Fuel,
  ShoppingCart,
  Film,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  locationSchema,
  type LocationRequest,
  type CoordinatesRequest,
  type MidpointResponse,
  PLACE_TYPES,
  type PlaceType,
  type Coordinates,
} from "@shared/schema";

const FILTER_ICONS = {
  cafe: Coffee,
  restaurant: Utensils,
  park: Trees,
  gas_station: Fuel,
  shopping_mall: ShoppingCart,
  movie_theater: Film,
} as const;

interface LocationFormProps {
  onSearch: (data: LocationRequest) => void;
  onResults: (data: MidpointResponse) => void;
  onInputLocations?: (
    locations: { address: string; coordinates: { lat: number; lng: number } }[]
  ) => void;
}

export default function LocationForm({
  onSearch,
  onResults,
  onInputLocations,
}: LocationFormProps) {
  const [selectedFilters, setSelectedFilters] = useState<PlaceType[]>([]);
  const { toast } = useToast();

  const form = useForm<LocationRequest>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      locations: ["", ""],
      filters: [],
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (data: LocationRequest) => {
      // Geocode addresses on frontend first
      const geocodePromises = data.locations.map(async (address) => {
        return new Promise<Coordinates>((resolve, reject) => {
          if (
            !window.google ||
            !window.google.maps ||
            !window.google.maps.Geocoder
          ) {
            reject(new Error("Google Maps not loaded"));
            return;
          }

          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address }, (results: any, status: any) => {
            if (status === "OK" && results?.[0]?.geometry?.location) {
              const location = results[0].geometry.location;
              resolve({
                lat:
                  typeof location.lat === "function"
                    ? location.lat()
                    : location.lat,
                lng:
                  typeof location.lng === "function"
                    ? location.lng()
                    : location.lng,
              });
            } else {
              reject(new Error(`Could not find location: ${address}`));
            }
          });
        });
      });

      try {
        const coords = await Promise.all(geocodePromises);

        // Pass input locations to parent component
        if (onInputLocations) {
          onInputLocations(
            data.locations.map((address, idx) => ({
              address,
              coordinates: coords[idx],
            }))
          );
        }

        const coordinatesData: CoordinatesRequest = {
          coords,
          filters: data.filters,
        };

        const response = await apiRequest(
          "POST",
          "/api/midpoint",
          coordinatesData
        );
        return response.json() as Promise<MidpointResponse>;
      } catch (error) {
        throw error;
      }
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
        description:
          error instanceof Error ? error.message : "Failed to find midpoint",
        variant: "destructive",
      });
    },
  });

  const toggleFilter = (filterType: PlaceType) => {
    setSelectedFilters((prev) => {
      const newFilters = prev.includes(filterType)
        ? prev.filter((f) => f !== filterType)
        : [...prev, filterType];

      form.setValue("filters", newFilters);
      return newFilters;
    });
  };

  const onSubmit = (data: LocationRequest) => {
    const searchData = {
      ...data,
      filters: selectedFilters,
    };

    onSearch(searchData);
    searchMutation.mutate(searchData);
  };

  return (
    <div className="bg-surface rounded-xl shadow-lg p-6 sticky top-8">
      <h3 className="text-xl font-semibold mb-6 text-secondary">
        Enter Locations
      </h3>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Location Inputs */}
          <div className="space-y-4">
            {form.watch("locations").map((value, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`locations.${index}` as unknown as any}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <LocationAutocomplete
                            label={`Location ${index + 1}`}
                            data-testid={`input-location-${index}`}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                        {form.watch("locations").length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const current = form.getValues("locations");
                              current.splice(index, 1);
                              form.setValue("locations", [...current]);
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const current = form.getValues("locations");
                  form.setValue("locations", [...current, ""]);
                }}
              >
                Add another location
              </Button>
            </div>
          </div>

          {/* Filter Categories */}
          <div>
            <h4 className="text-sm font-semibold text-secondary mb-3">
              Filter by Type
            </h4>
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
