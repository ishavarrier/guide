import { Star, Navigation, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Place } from "@shared/schema";
import { useState } from "react";

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  const [imageError, setImageError] = useState(false);

  const getPlaceTypeColor = (types: string[]) => {
    if (types.includes("restaurant") || types.includes("food"))
      return "bg-accent text-white";
    if (types.includes("cafe") || types.includes("coffee"))
      return "bg-primary text-white";
    if (types.includes("park")) return "bg-success text-white";
    if (types.includes("gas_station")) return "bg-yellow-500 text-white";
    if (types.includes("shopping_mall") || types.includes("store"))
      return "bg-purple-500 text-white";
    if (types.includes("movie_theater") || types.includes("entertainment"))
      return "bg-pink-500 text-white";
    return "bg-gray-500 text-white";
  };

  const getPlaceTypeName = (types: string[]) => {
    if (types.includes("restaurant") || types.includes("food"))
      return "Restaurant";
    if (types.includes("cafe") || types.includes("coffee")) return "Cafe";
    if (types.includes("park")) return "Park";
    if (types.includes("gas_station")) return "Gas Station";
    if (types.includes("shopping_mall") || types.includes("store"))
      return "Shopping";
    if (types.includes("movie_theater") || types.includes("entertainment"))
      return "Entertainment";
    return "Place";
  };

  const getPriceLevel = (priceLevel?: number) => {
    if (!priceLevel) return null;
    return "$".repeat(priceLevel);
  };

  const formatRatingCount = (count?: number) => {
    if (!count) return null;
    if (count >= 1000) {
      return `(${(count / 1000).toFixed(1)}k)`;
    }
    return `(${count})`;
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex text-yellow-400">
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
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
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <Star key={`empty-${i}`} size={14} className="text-gray-300" />
          ))}
      </div>
    );
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      place.address
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
      data-testid={`card-place-${place.place_id}`}
    >
      {/* Photo Section */}
      {place.photos && place.photos.length > 0 && !imageError && (
        <div className="h-48 bg-gray-100 relative">
          <img
            src={place.photos[0].url}
            alt={place.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getPlaceTypeColor(
                place.types
              )}`}
            >
              {getPlaceTypeName(place.types)}
            </span>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4
              className="text-lg font-semibold text-secondary mb-1"
              data-testid={`text-place-name-${place.place_id}`}
            >
              {place.name}
            </h4>
            <p
              className="text-gray-600 text-sm mb-2"
              data-testid={`text-place-address-${place.place_id}`}
            >
              {place.address}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDirections}
            className="text-primary hover:text-blue-700 transition-colors flex-shrink-0"
            data-testid={`button-directions-${place.place_id}`}
          >
            <Navigation size={18} />
          </Button>
        </div>

        {/* Rating and Price Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {place.rating && (
              <div className="flex items-center space-x-1">
                {renderStars(place.rating)}
                <span
                  className="text-gray-600 font-medium"
                  data-testid={`text-place-rating-${place.place_id}`}
                >
                  {place.rating.toFixed(1)}
                </span>
                {place.user_ratings_total && (
                  <span className="text-gray-500 text-sm">
                    {formatRatingCount(place.user_ratings_total)}
                  </span>
                )}
              </div>
            )}
            {place.price_level && (
              <div className="flex items-center space-x-1 text-green-600">
                <DollarSign size={14} />
                <span className="text-sm font-medium">
                  {getPriceLevel(place.price_level)}
                </span>
              </div>
            )}
          </div>
          <span
            className="text-gray-500 text-sm"
            data-testid={`text-place-distance-${place.place_id}`}
          >
            {place.distance.toFixed(1)} mi
          </span>
        </div>

        {/* Travel Summaries from each input location */}
        {place.travel_summaries && place.travel_summaries.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-gray-500 mb-1">
              Travel from each location:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {place.travel_summaries.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1"
                >
                  <div className="flex items-center space-x-2">
                    <Users size={12} className="text-gray-400" />
                    <span>From L{(s.originIndex ?? idx) + 1}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-700">
                      {s.durationText ?? "-"}
                    </span>
                    <span className="text-gray-400 ml-1">
                      ({s.distanceText ?? "-"})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Place Types */}
        {place.types && place.types.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {place.types.slice(0, 3).map((type, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {type.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
