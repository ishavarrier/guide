import { z } from "zod";

export const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export const locationSchema = z.object({
  locations: z
    .array(z.string().min(1, "Location is required"))
    .min(2, "Please enter at least two locations"),
  filters: z.array(z.string()).default([]),
});

export const coordinatesRequestSchema = z.object({
  coords: z.array(coordinatesSchema).min(2),
  filters: z.array(z.string()).default([]),
});

export const placeSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  address: z.string(),
  rating: z.number().optional(),
  user_ratings_total: z.number().optional(),
  price_level: z.number().optional(),
  photos: z
    .array(
      z.object({
        photo_reference: z.string(),
        height: z.number(),
        width: z.number(),
        url: z.string(),
      })
    )
    .optional(),
  types: z.array(z.string()),
  distance: z.number(),
  coordinates: coordinatesSchema,
});

export const midpointResponseSchema = z.object({
  midpoint: coordinatesSchema,
  midpointAddress: z.string(),
  places: z.array(placeSchema),
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
  movie_theater: { name: "Entertainment", icon: "film" },
} as const;

export type PlaceType = keyof typeof PLACE_TYPES;
