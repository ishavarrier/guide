import { type LocationRequest, type MidpointResponse, type Coordinates, type Place } from "@shared/schema";

export interface IStorage {
  // Storage interface can be extended if needed for caching
}

export class MemStorage implements IStorage {
  constructor() {
    // No persistent storage needed for this application
  }
}

export const storage = new MemStorage();
