import { environment } from "../config/environment";
import { getApiBaseUrl } from "../utils/network";

// API Configuration
const API_BASE_URL = getApiBaseUrl();

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

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
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

      const fullUrl = `${this.baseUrl}/autocomplete?${params}`;

      console.log("🔍 PlacesService - Autocomplete Request:");
      console.log("  📍 URL:", fullUrl);
      console.log("  🔑 Base URL:", this.baseUrl);
      console.log("  📝 Input:", input.trim());
      console.log("  🎫 Session Token:", sessionToken || "none");

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📡 PlacesService - Response:");
      console.log("  ✅ Status:", response.status);
      console.log("  📊 Status Text:", response.statusText);
      console.log(
        "  🔗 Headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ PlacesService - Error Response:");
        console.error("  🚨 Status:", response.status);
        console.error("  📄 Response Body:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("✅ PlacesService - Success Response:");
      console.log("  📊 Data:", data);
      console.log("  📈 Results Count:", data?.length || 0);

      return data || [];
    } catch (error) {
      console.error("❌ PlacesService - Error fetching place autocomplete:");
      console.error("  🚨 Error:", error);
      console.error("  📍 URL:", `${this.baseUrl}/autocomplete`);
      console.error("  🔑 Base URL:", this.baseUrl);
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

  /**
   * Check if the backend is running
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: "GET",
      });
      return response.ok;
    } catch (error) {
      console.error("Backend health check failed:", error);
      return false;
    }
  }
}

export default new PlacesService();
