import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  locationSchema,
  coordinatesRequestSchema,
  type LocationRequest,
  type CoordinatesRequest,
  type MidpointResponse,
  type Coordinates,
  type Place,
} from "@shared/schema";

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

console.log("Environment variables check:");
console.log("GOOGLE_MAPS_API_KEY:", process.env.GOOGLE_MAPS_API_KEY);
console.log("VITE_GOOGLE_MAPS_API_KEY:", process.env.VITE_GOOGLE_MAPS_API_KEY);
console.log("Final GOOGLE_MAPS_API_KEY:", GOOGLE_MAPS_API_KEY);

// Calculate centroid between N coordinates (spherical mean approximation)
function calculateCentroid(coords: Coordinates[]): Coordinates {
  if (coords.length === 0) {
    throw new Error("No coordinates provided");
  }

  let x = 0;
  let y = 0;
  let z = 0;

  coords.forEach(({ lat, lng }) => {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    x += Math.cos(latRad) * Math.cos(lngRad);
    y += Math.cos(latRad) * Math.sin(lngRad);
    z += Math.sin(latRad);
  });

  const total = coords.length;
  x = x / total;
  y = y / total;
  z = z / total;

  const lngRad = Math.atan2(y, x);
  const hyp = Math.sqrt(x * x + y * y);
  const latRad = Math.atan2(z, hyp);

  return {
    lat: (latRad * 180) / Math.PI,
    lng: (lngRad * 180) / Math.PI,
  };
}

// Calculate geodesic midpoint between two coordinates
function calculateGeodesicMidpoint(
  a: Coordinates,
  b: Coordinates
): Coordinates {
  const lat1 = (a.lat * Math.PI) / 180;
  const lon1 = (a.lng * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const lon2 = (b.lng * Math.PI) / 180;

  const dLon = lon2 - lon1;

  const Bx = Math.cos(lat2) * Math.cos(dLon);
  const By = Math.cos(lat2) * Math.sin(dLon);

  const lat3 = Math.atan2(
    Math.sin(lat1) + Math.sin(lat2),
    Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
  );
  const lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);

  return { lat: (lat3 * 180) / Math.PI, lng: (lon3 * 180) / Math.PI };
}

// Calculate distance between two coordinates in miles
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Compute dynamic search radius (in meters) based on input coordinates
function computeDynamicRadiusMeters(coords: Coordinates[]): number {
  if (coords.length < 2) {
    // Minimum radius of 2 miles if only one coordinate somehow
    const minMeters = 2 * 1609.34;
    return Math.min(50000, Math.max(1000, Math.round(minMeters)));
  }

  // Determine the maximum pairwise distance between any two inputs (miles)
  let maxMiles = 0;
  for (let i = 0; i < coords.length; i++) {
    for (let j = i + 1; j < coords.length; j++) {
      const d = calculateDistance(coords[i], coords[j]);
      if (d > maxMiles) maxMiles = d;
    }
  }

  const radiusMiles = Math.max(maxMiles * 0.3, 2); // 30% of distance, min 2 miles
  const radiusMeters = radiusMiles * 1609.34;
  // Google Places Nearby Search allows up to 50,000 meters
  return Math.min(50000, Math.max(500, Math.round(radiusMeters)));
}

// Ensure midpoint lies between the input locations; if not, correct it
function validateAndCorrectMidpoint(
  midpoint: Coordinates,
  coords: Coordinates[]
): Coordinates {
  if (coords.length < 2) return midpoint;

  // Find the farthest pair (diameter)
  let maxMiles = -1;
  let farA = coords[0];
  let farB = coords[1];
  for (let i = 0; i < coords.length; i++) {
    for (let j = i + 1; j < coords.length; j++) {
      const d = calculateDistance(coords[i], coords[j]);
      if (d > maxMiles) {
        maxMiles = d;
        farA = coords[i];
        farB = coords[j];
      }
    }
  }

  // Midpoint should be within half the farthest distance from each of the farthest endpoints
  const tolMiles = 0.25; // small tolerance
  const half = maxMiles / 2 + tolMiles;
  const dToA = calculateDistance(midpoint, farA);
  const dToB = calculateDistance(midpoint, farB);

  if (dToA > half || dToB > half) {
    // Correct to geodesic midpoint of the farthest pair
    return calculateGeodesicMidpoint(farA, farB);
  }

  return midpoint;
}

// Geocode an address using Google Maps API
async function geocodeAddress(address: string): Promise<Coordinates> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GOOGLE_MAPS_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to geocode address");
  }

  const data = await response.json();

  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    throw new Error(`Could not find location: ${address}`);
  }

  const location = data.results[0].geometry.location;
  return { lat: location.lat, lng: location.lng };
}

// Reverse geocode coordinates to get address
async function reverseGeocode(coordinates: Coordinates): Promise<string> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lng}&key=${GOOGLE_MAPS_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to reverse geocode coordinates");
  }

  const data = await response.json();

  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    return `${coordinates.lat.toFixed(4)}°, ${coordinates.lng.toFixed(4)}°`;
  }

  return data.results[0].formatted_address;
}

// Get photo URL from Google Places API
function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  if (!GOOGLE_MAPS_API_KEY) {
    return "";
  }
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
}

// Search for places near coordinates
async function searchPlaces(
  coordinates: Coordinates,
  types: string[],
  radiusMeters: number
): Promise<Place[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  const typeFilter =
    types.length > 0
      ? types.join("|")
      : "restaurant|cafe|park|gas_station|shopping_mall|movie_theater";

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=${radiusMeters}&type=${typeFilter}&key=${GOOGLE_MAPS_API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to search for places");
  }

  const data = await response.json();

  if (data.status !== "OK") {
    throw new Error(`Places API error: ${data.status}`);
  }

  return data.results
    .map(
      (place: any): Place => ({
        place_id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address || "",
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        price_level: place.price_level,
        photos:
          place.photos?.map((photo: any) => ({
            photo_reference: photo.photo_reference,
            height: photo.height,
            width: photo.width,
            url: getPhotoUrl(photo.photo_reference, 400),
          })) || [],
        types: place.types || [],
        distance: calculateDistance(coordinates, {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        }),
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
      })
    )
    .sort((a: Place, b: Place) => a.distance - b.distance);
}

// Compute per-origin travel summaries to each place using Google Distance Matrix
async function computeTravelSummaries(
  origins: Coordinates[],
  places: Place[],
  mode: "driving" | "walking" | "bicycling" | "transit" = "driving"
): Promise<Place[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    return places;
  }

  if (places.length === 0 || origins.length === 0) return places;

  // Build request parameters
  const originsParam = origins.map((o) => `${o.lat},${o.lng}`).join("|");
  const destinationsParam = places
    .map((p) => `${p.coordinates.lat},${p.coordinates.lng}`)
    .join("|");

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    originsParam
  )}&destinations=${encodeURIComponent(
    destinationsParam
  )}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    // If DM fails, just return places as-is
    return places;
  }

  const data = await response.json();
  if (data.status !== "OK" || !Array.isArray(data.rows)) {
    return places;
  }

  // data.rows is per origin; each row.elements is per destination in order
  // We will construct an array of summaries for each place (per origin)
  const enhanced = places.map((place, destIdx) => {
    const travel_summaries = data.rows.map((row: any, originIndex: number) => {
      const element = row?.elements?.[destIdx];
      const status = element?.status;
      if (!element || status !== "OK") {
        return {
          originIndex,
          distanceMeters: null,
          durationSeconds: null,
          distanceText: null,
          durationText: null,
          mode,
        };
      }
      return {
        originIndex,
        distanceMeters: element.distance?.value ?? null,
        durationSeconds: element.duration?.value ?? null,
        distanceText: element.distance?.text ?? null,
        durationText: element.duration?.text ?? null,
        mode,
      };
    });

    return { ...place, travel_summaries } as Place;
  });

  return enhanced;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Find midpoint and places using coordinates (to avoid API key restrictions)
  app.post("/api/midpoint", async (req, res) => {
    try {
      console.log("Received request body:", JSON.stringify(req.body, null, 2));
      const validatedData = coordinatesRequestSchema.parse(req.body);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));

      // Calculate centroid from provided coordinates
      let midpoint = calculateCentroid(validatedData.coords);

      // Validate that the midpoint is actually between the input locations; correct if needed
      midpoint = validateAndCorrectMidpoint(midpoint, validatedData.coords);

      // Get midpoint address (this may fail due to API restrictions, so we'll make it optional)
      let midpointAddress = `${midpoint.lat.toFixed(
        4
      )}°, ${midpoint.lng.toFixed(4)}°`;
      try {
        midpointAddress = await reverseGeocode(midpoint);
      } catch (error) {
        console.warn("Reverse geocoding failed, using coordinates:", error);
      }

      // Compute dynamic radius from the spread of user locations
      const radiusMeters = computeDynamicRadiusMeters(validatedData.coords);

      // Search for places near midpoint with dynamic radius
      let places = await searchPlaces(
        midpoint,
        validatedData.filters,
        radiusMeters
      );

      // Limit early to reduce Distance Matrix elements
      places = places.slice(0, 20);

      // Compute per-origin travel summaries for these places
      try {
        places = await computeTravelSummaries(
          validatedData.coords,
          places,
          "driving"
        );
      } catch (e) {
        console.warn(
          "Distance Matrix failed, returning places without travel summaries",
          e
        );
      }

      const response: MidpointResponse = {
        midpoint,
        midpointAddress,
        places,
        radiusMeters,
      };

      res.json(response);
    } catch (error) {
      console.error("Error finding midpoint:", error);
      if (error instanceof Error && error.name === "ZodError") {
        console.error("Validation error details:", error);
        res.status(400).json({
          message: "Invalid request data",
          details: error.message,
        });
      } else {
        res.status(400).json({
          message:
            error instanceof Error
              ? error.message
              : "Failed to find midpoint and places",
        });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
