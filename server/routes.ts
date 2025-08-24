import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { locationSchema, coordinatesRequestSchema, type LocationRequest, type CoordinatesRequest, type MidpointResponse, type Coordinates, type Place } from "@shared/schema";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

// Calculate midpoint between two coordinates
function calculateMidpoint(coord1: Coordinates, coord2: Coordinates): Coordinates {
  const lat1Rad = (coord1.lat * Math.PI) / 180;
  const lat2Rad = (coord2.lat * Math.PI) / 180;
  const lng1Rad = (coord1.lng * Math.PI) / 180;
  const lng2Rad = (coord2.lng * Math.PI) / 180;

  const dLng = lng2Rad - lng1Rad;

  const bx = Math.cos(lat2Rad) * Math.cos(dLng);
  const by = Math.cos(lat2Rad) * Math.sin(dLng);

  const lat3 = Math.atan2(
    Math.sin(lat1Rad) + Math.sin(lat2Rad),
    Math.sqrt((Math.cos(lat1Rad) + bx) * (Math.cos(lat1Rad) + bx) + by * by)
  );
  const lng3 = lng1Rad + Math.atan2(by, Math.cos(lat1Rad) + bx);

  return {
    lat: (lat3 * 180) / Math.PI,
    lng: (lng3 * 180) / Math.PI
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
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
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

// Search for places near coordinates
async function searchPlaces(coordinates: Coordinates, types: string[]): Promise<Place[]> {
  // For now, return mock data since the API key is restricted for server-side calls
  // In production, you would either:
  // 1. Use a server-side API key without referer restrictions, or
  // 2. Move this search to the frontend
  
  console.log("Searching for places near:", coordinates, "types:", types);
  
  // Return mock places data for demonstration
  const mockPlaces: Place[] = [
    {
      place_id: "mock_1",
      name: "Central Cafe",
      address: "123 Main St, Midpoint City",
      rating: 4.5,
      distance: 0.2,
      types: ["cafe", "restaurant"]
    },
    {
      place_id: "mock_2", 
      name: "Midpoint Park",
      address: "456 Park Ave, Midpoint City",
      rating: 4.2,
      distance: 0.5,
      types: ["park"]
    },
    {
      place_id: "mock_3",
      name: "Gas & Go Station", 
      address: "789 Highway Rd, Midpoint City",
      rating: 3.8,
      distance: 0.8,
      types: ["gas_station"]
    },
    {
      place_id: "mock_4",
      name: "Pizza Palace",
      address: "321 Food St, Midpoint City", 
      rating: 4.7,
      distance: 0.3,
      types: ["restaurant"]
    },
    {
      place_id: "mock_5",
      name: "Shopping Center",
      address: "654 Mall Blvd, Midpoint City",
      rating: 4.0,
      distance: 1.2,
      types: ["shopping_mall"]
    }
  ];

  // Filter by selected types if any
  if (types.length > 0) {
    return mockPlaces.filter(place => 
      place.types.some(type => types.includes(type))
    );
  }

  return mockPlaces;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Find midpoint and places using coordinates (to avoid API key restrictions)
  app.post("/api/midpoint", async (req, res) => {
    try {
      const validatedData = coordinatesRequestSchema.parse(req.body);
      
      // Calculate midpoint from provided coordinates
      const midpoint = calculateMidpoint(validatedData.coord1, validatedData.coord2);

      // Get midpoint address (this may fail due to API restrictions, so we'll make it optional)
      let midpointAddress = `${midpoint.lat.toFixed(4)}°, ${midpoint.lng.toFixed(4)}°`;
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
        places: places.slice(0, 20) // Limit to 20 results
      };

      res.json(response);
    } catch (error) {
      console.error("Error finding midpoint:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to find midpoint and places" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
