import { z } from "zod";

export const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number()
});

export const locationSchema = z.object({
  location1: z.string().min(1, "First location is required"),
  location2: z.string().min(1, "Second location is required"),
  filters: z.array(z.string()).default([])
});

export const coordinatesRequestSchema = z.object({
  coord1: coordinatesSchema,
  coord2: coordinatesSchema,
  filters: z.array(z.string()).default([])
});

export const placeSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  address: z.string(),
  rating: z.number().optional(),
  types: z.array(z.string()),
  distance: z.number(),
  coordinates: coordinatesSchema.optional()
});

export const midpointResponseSchema = z.object({
  midpoint: coordinatesSchema,
  midpointAddress: z.string(),
  places: z.array(placeSchema)
});

export type LocationRequest = z.infer<typeof locationSchema>;
export type CoordinatesRequest = z.infer<typeof coordinatesRequestSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Place = z.infer<typeof placeSchema>;
export type MidpointResponse = z.infer<typeof midpointResponseSchema>;

export const PLACE_TYPES = {
  cafe: { name: "Cafes", icon: "coffee" },
  restaurant: { name: "Restaurants", icon: "utensils" },
  park: { name: "Parks", icon: "tree" },
  gas_station: { name: "Gas Stations", icon: "gas-pump" },
  shopping_mall: { name: "Shopping", icon: "shopping-cart" },
  movie_theater: { name: "Entertainment", icon: "film" }
} as const;

export type PlaceType = keyof typeof PLACE_TYPES;
