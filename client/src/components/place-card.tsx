import { Star, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Place } from "@shared/schema";

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const getPlaceTypeColor = (types: string[]) => {
    if (types.includes("restaurant") || types.includes("food")) return "bg-accent text-white";
    if (types.includes("cafe") || types.includes("coffee")) return "bg-primary text-white";
    if (types.includes("park")) return "bg-success text-white";
    if (types.includes("gas_station")) return "bg-yellow-500 text-white";
    if (types.includes("shopping_mall") || types.includes("store")) return "bg-purple-500 text-white";
    if (types.includes("movie_theater") || types.includes("entertainment")) return "bg-pink-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getPlaceTypeName = (types: string[]) => {
    if (types.includes("restaurant") || types.includes("food")) return "Restaurant";
    if (types.includes("cafe") || types.includes("coffee")) return "Cafe";
    if (types.includes("park")) return "Park";
    if (types.includes("gas_station")) return "Gas Station";
    if (types.includes("shopping_mall") || types.includes("store")) return "Shopping";
    if (types.includes("movie_theater") || types.includes("entertainment")) return "Entertainment";
    return "Place";
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex text-yellow-400">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={`full-${i}`} size={14} fill="currentColor" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star size={14} className="text-gray-300" />
            <Star 
              size={14} 
              fill="currentColor" 
              className="absolute top-0 left-0" 
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          </div>
        )}
        {Array(emptyStars).fill(0).map((_, i) => (
          <Star key={`empty-${i}`} size={14} className="text-gray-300" />
        ))}
      </div>
    );
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow" data-testid={`card-place-${place.place_id}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-lg font-semibold text-secondary" data-testid={`text-place-name-${place.place_id}`}>
              {place.name}
            </h4>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPlaceTypeColor(place.types)}`}>
              {getPlaceTypeName(place.types)}
            </span>
          </div>
          <p className="text-gray-600 mb-2" data-testid={`text-place-address-${place.place_id}`}>
            {place.address}
          </p>
          <div className="flex items-center space-x-4 text-sm">
            {place.rating && (
              <div className="flex items-center space-x-1">
                {renderStars(place.rating)}
                <span className="text-gray-600" data-testid={`text-place-rating-${place.place_id}`}>
                  {place.rating.toFixed(1)}
                </span>
              </div>
            )}
            <span className="text-gray-500" data-testid={`text-place-distance-${place.place_id}`}>
              {place.distance.toFixed(1)} mi from midpoint
            </span>
          </div>
        </div>
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDirections}
            className="text-primary hover:text-blue-700 transition-colors"
            data-testid={`button-directions-${place.place_id}`}
          >
            <Navigation size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
