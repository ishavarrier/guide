import { useEffect, useRef, useState } from "react";
import { type MidpointResponse, type Place } from "@shared/schema";

interface InteractiveMapProps {
  midpoint: MidpointResponse["midpoint"];
  midpointAddress: string;
  places: Place[];
  inputLocations?: {
    address: string;
    coordinates: { lat: number; lng: number };
  }[];
  radiusMeters?: number;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
    googleMapsLoaded: boolean;
    googleMapsCallbacks: (() => void)[];
  }
}

export default function InteractiveMap({
  midpoint,
  midpointAddress,
  places,
  inputLocations,
  radiusMeters,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [radiusCircle, setRadiusCircle] = useState<any>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.google?.maps) return;

      console.log("Initializing map with midpoint:", midpoint);

      // Create the map
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: midpoint,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      setMap(mapInstance);

      // Create input location markers
      const inputMarkers: any[] = [];
      if (inputLocations && inputLocations.length > 0) {
        const colorPalette = [
          "#10B981",
          "#8B5CF6",
          "#F59E0B",
          "#3B82F6",
          "#EF4444",
          "#14B8A6",
          "#DB2777",
          "#0EA5E9",
          "#84CC16",
          "#F97316",
        ];
        inputLocations.forEach((loc, idx) => {
          const color = colorPalette[idx % colorPalette.length];

          const marker = new window.google.maps.Marker({
            position: loc.coordinates,
            map: mapInstance,
            title: `Location ${idx + 1}: ${loc.address}`,
            icon: {
              path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: "#1F2937",
              strokeWeight: 2,
            },
            zIndex: 800,
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold text-lg mb-1" style="color:${color}">Location ${
              idx + 1
            }</h3>
                <p class="text-sm text-gray-600">${loc.address}</p>
                <p class="text-xs text-gray-500">
                  ${loc.coordinates.lat.toFixed(
                    4
                  )}° N, ${loc.coordinates.lng.toFixed(4)}° W
                </p>
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open(mapInstance, marker);
          });

          inputMarkers.push(marker);
        });
      }

      // Create enhanced midpoint marker with pulsing animation
      const midpointMarker = new window.google.maps.Marker({
        position: midpoint,
        map: mapInstance,
        title: `Midpoint: ${midpointAddress}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: "#EF4444",
          fillOpacity: 0.9,
          strokeColor: "#FFFFFF",
          strokeWeight: 4,
        },
        zIndex: 1000,
        animation: window.google.maps.Animation.BOUNCE,
      });

      // Remove animation after a few seconds
      setTimeout(() => {
        midpointMarker.setAnimation(null);
      }, 2000);

      // Create info window for midpoint
      const midpointInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold text-lg text-blue-600 mb-1">Midpoint</h3>
            <p class="text-sm text-gray-600 mb-1">${midpointAddress}</p>
            <p class="text-xs text-gray-500">
              ${midpoint.lat.toFixed(4)}° N, ${midpoint.lng.toFixed(4)}° W
            </p>
          </div>
        `,
      });

      midpointMarker.addListener("click", () => {
        midpointInfoWindow.open(mapInstance, midpointMarker);
      });

      // Create radius circle around midpoint
      const circle = new window.google.maps.Circle({
        strokeColor: "#3B82F6",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#3B82F6",
        fillOpacity: 0.1,
        map: mapInstance,
        center: midpoint,
        radius: radiusMeters ?? 5000,
        clickable: false,
      });

      setRadiusCircle(circle);

      // Create place markers
      const placeMarkers = places.map((place, index) => {
        const marker = new window.google.maps.Marker({
          position: place.coordinates,
          map: mapInstance,
          title: place.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#F59E0B",
            fillOpacity: 0.8,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
          zIndex: 500,
        });

        // Create info window for place
        const placeInfoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2 max-w-xs">
              <h3 class="font-semibold text-base text-orange-600 mb-1">${
                place.name
              }</h3>
              <p class="text-sm text-gray-600 mb-1">${place.address}</p>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>${place.distance.toFixed(1)} mi away</span>
                ${
                  place.rating
                    ? `<span>⭐ ${place.rating.toFixed(1)}</span>`
                    : ""
                }
              </div>
              <div class="mt-1">
                ${place.types
                  .slice(0, 3)
                  .map(
                    (type) =>
                      `<span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mr-1 mb-1">${type.replace(
                        /_/g,
                        " "
                      )}</span>`
                  )
                  .join("")}
              </div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          placeInfoWindow.open(mapInstance, marker);
        });

        return marker;
      });

      setMarkers([...inputMarkers, midpointMarker, ...placeMarkers]);
      setIsLoaded(true);

      console.log(
        `Map initialized with ${inputMarkers.length} input markers, 1 midpoint marker, and ${placeMarkers.length} place markers`
      );
    };

    // Load Google Maps script if not already loaded
    const loadGoogleMaps = () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        console.error("Google Maps API key not found");
        return;
      }

      if (window.google?.maps) {
        console.log("Google Maps already loaded, initializing map");
        initMap();
        return;
      }

      // Initialize global callback system if not already done
      if (!window.googleMapsCallbacks) {
        window.googleMapsCallbacks = [];
        window.googleMapsLoaded = false;

        window.initGoogleMaps = () => {
          console.log("Google Maps callback fired, executing callbacks");
          window.googleMapsLoaded = true;
          window.googleMapsCallbacks.forEach((callback) => callback());
        };
      }

      // Add this component's callback to the queue
      window.googleMapsCallbacks.push(initMap);

      // Only load the script if it hasn't been loaded yet
      if (
        !window.googleMapsLoaded &&
        !document.querySelector('script[src*="maps.googleapis.com"]')
      ) {
        console.log("Loading Google Maps script for map...");
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          console.error("Failed to load Google Maps script");
        };
        document.head.appendChild(script);
      }
    };

    loadGoogleMaps();

    return () => {
      // Cleanup markers and circle when component unmounts
      markers.forEach((marker) => marker.setMap(null));
      if (radiusCircle) {
        radiusCircle.setMap(null);
      }
    };
  }, [midpoint, midpointAddress, places, inputLocations, radiusMeters]);

  // Update map when places change
  useEffect(() => {
    if (!map || !window.google?.maps) return;

    // Clear existing place markers (keep input and midpoint markers)
    // Input markers (0..N-1), Midpoint marker (N), Place markers (N+1..)
    const inputMarkerCount = inputLocations ? inputLocations.length : 0;
    const midpointIndex = inputMarkerCount;
    markers
      .slice(inputMarkerCount + 1)
      .forEach((marker) => marker.setMap(null));

    // Add new place markers
    const placeMarkers = places.map((place) => {
      const marker = new window.google.maps.Marker({
        position: place.coordinates,
        map: map,
        title: place.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#F59E0B",
          fillOpacity: 0.8,
          strokeColor: "#FFFFFF",
          strokeWeight: 2,
        },
        zIndex: 500,
      });

      const placeInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-2 max-w-xs">
            <h3 class="font-semibold text-base text-orange-600 mb-1">${
              place.name
            }</h3>
            <p class="text-sm text-gray-600 mb-1">${place.address}</p>
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>${place.distance.toFixed(1)} mi away</span>
              ${
                place.rating ? `<span>⭐ ${place.rating.toFixed(1)}</span>` : ""
              }
            </div>
            <div class="mt-1">
              ${place.types
                .slice(0, 3)
                .map(
                  (type) =>
                    `<span class="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mr-1 mb-1">${type.replace(
                      /_/g,
                      " "
                    )}</span>`
                )
                .join("")}
            </div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        placeInfoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers((prev) => [
      ...prev.slice(0, inputMarkerCount + 1),
      ...placeMarkers,
    ]);
  }, [places, map, inputLocations]);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full h-64 rounded-lg border border-gray-200"
        style={{ minHeight: "400px" }}
      />
      {isLoaded && (
        <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg p-3 text-xs">
          <div className="space-y-2">
            {inputLocations && inputLocations.length > 0 && (
              <div className="space-y-1">
                {inputLocations.map((_, idx) => {
                  const colorPalette = [
                    "#10B981",
                    "#8B5CF6",
                    "#F59E0B",
                    "#3B82F6",
                    "#EF4444",
                    "#14B8A6",
                    "#DB2777",
                    "#0EA5E9",
                    "#84CC16",
                    "#F97316",
                  ];
                  const color = colorPalette[idx % colorPalette.length];
                  return (
                    <div key={idx} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span>Location {idx + 1}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span className="font-semibold">Midpoint</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span>Places ({places.length})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-dashed rounded-full mr-2"></div>
              <span>
                Search Radius {((radiusMeters ?? 5000) / 1000).toFixed(1)} km
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
