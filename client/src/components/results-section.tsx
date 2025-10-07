import { CheckCircle, Map } from "lucide-react";
import PlaceCard from "@/components/place-card";
import InteractiveMap from "@/components/interactive-map";
import { type LocationRequest, type MidpointResponse } from "@shared/schema";

interface ResultsSectionProps {
  searchData: LocationRequest | null;
  results: MidpointResponse | null;
  inputLocations?:
    | { address: string; coordinates: { lat: number; lng: number } }[]
    | null;
}

export default function ResultsSection({
  searchData,
  results,
  inputLocations,
}: ResultsSectionProps) {
  if (!searchData && !results) {
    return (
      <div className="space-y-6">
        <div className="bg-surface rounded-xl shadow-lg p-6 text-center">
          <Map className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            Ready to Find Your Midpoint
          </h3>
          <p className="text-gray-500">
            Enter locations and select your preferred place types to get
            started.
          </p>
        </div>
      </div>
    );
  }

  if (searchData && !results) {
    return (
      <div className="space-y-6">
        <div className="bg-surface rounded-xl shadow-lg p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-secondary mb-4">
            Map View
          </h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
              <p className="text-gray-500">
                Finding midpoint and nearby places...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="space-y-6">
      {/* Midpoint Information */}
      <div
        className="bg-surface rounded-xl shadow-lg p-6"
        data-testid="midpoint-info"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-secondary">
            Midpoint Location
          </h3>
          <span className="bg-success text-white px-3 py-1 rounded-full text-sm font-medium">
            <CheckCircle className="inline mr-1" size={14} />
            Found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Coordinates</p>
            <p
              className="text-secondary"
              data-testid="text-midpoint-coordinates"
            >
              {results.midpoint.lat.toFixed(4)}° N,{" "}
              {results.midpoint.lng.toFixed(4)}° W
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Address</p>
            <p className="text-secondary" data-testid="text-midpoint-address">
              {results.midpointAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-surface rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-secondary mb-4">Map View</h3>
        <InteractiveMap
          midpoint={results.midpoint}
          midpointAddress={results.midpointAddress}
          places={results.places}
          inputLocations={inputLocations}
        />
      </div>

      {/* Results List */}
      <div className="bg-surface rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-secondary">
            Nearby Places
          </h3>
          <span
            className="text-sm text-gray-600"
            data-testid="text-results-count"
          >
            {results.places.length} results found
          </span>
        </div>

        {results.places.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No places found matching your criteria.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Try removing some filters or searching a different area.
            </p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="places-list">
            {results.places.map((place) => (
              <PlaceCard key={place.place_id} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
