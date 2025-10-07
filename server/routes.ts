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
  types: string[]
): Promise<Place[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error("Google Maps API key is not configured");
  }

  const typeFilter =
    types.length > 0
      ? types.join("|")
      : "restaurant|cafe|park|gas_station|shopping_mall|movie_theater";

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coordinates.lat},${coordinates.lng}&radius=5000&type=${typeFilter}&key=${GOOGLE_MAPS_API_KEY}`
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Find midpoint and places using coordinates (to avoid API key restrictions)
  app.post("/api/midpoint", async (req, res) => {
    try {
      console.log("Received request body:", JSON.stringify(req.body, null, 2));
      const validatedData = coordinatesRequestSchema.parse(req.body);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));

      // Calculate centroid from provided coordinates
      const midpoint = calculateCentroid(validatedData.coords);

      // Get midpoint address (this may fail due to API restrictions, so we'll make it optional)
      let midpointAddress = `${midpoint.lat.toFixed(
        4
      )}°, ${midpoint.lng.toFixed(4)}°`;
      try {
        midpointAddress = await reverseGeocode(midpoint);
      } catch (error) {
        console.warn("Reverse geocoding failed, using coordinates:", error);
      }

      // Search for places near midpoint
      const places = await searchPlaces(midpoint, validatedData.filters);

      const response: MidpointResponse = {
        midpoint,
        midpointAddress,
        places: places.slice(0, 20), // Limit to 20 results
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
