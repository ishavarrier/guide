// API Configuration - adjust this to match your backend URL
const getApiBaseUrl = (): string => {
  // Try to get from environment variable, fallback to default
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl) return envUrl;
  
  // Default to localhost for development
  return 'http://localhost:8080/api/places';
};

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  types?: string[];
}

class PlacesService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || getApiBaseUrl();
  }

  /**
   * Get place autocomplete suggestions
   */
  async getPlaceAutocomplete(
    input: string,
    sessionToken?: string
  ): Promise<PlacePrediction[]> {
    try {
      const params = new URLSearchParams({
        input: input.trim(),
        ...(sessionToken && { sessionToken }),
      });

      const response = await fetch(`${this.baseUrl}/autocomplete?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Error fetching place autocomplete:", error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific place
   */
  async getPlaceDetails(
    placeId: string,
    sessionToken?: string
  ): Promise<PlaceDetails> {
    try {
      const params = new URLSearchParams({
        placeId,
        ...(sessionToken && { sessionToken }),
      });

      const response = await fetch(`${this.baseUrl}/details?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching place details:", error);
      throw error;
    }
  }
}

export default new PlacesService();


