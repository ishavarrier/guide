// Environment Configuration for Midpoint Activity Finder
// This file manages environment variables for different deployment scenarios

interface EnvironmentConfig {
  API_BASE_URL: string;
  DEBUG: boolean;
  GOOGLE_MAPS_API_KEY?: string;
}

// Get environment variables with fallbacks
const getEnvVar = (key: string, defaultValue?: string): string | undefined => {
  // In Expo, environment variables are available through process.env
  return process.env[key] || defaultValue;
};

// Development configuration (default)
const developmentConfig: EnvironmentConfig = {
  API_BASE_URL: "http://localhost:8080/api/places",
  DEBUG: true,
};

// Production configuration
const productionConfig: EnvironmentConfig = {
  API_BASE_URL: "https://your-backend-domain.com/api/places",
  DEBUG: false,
};

// Determine which environment we're in
const isDevelopment = __DEV__ || process.env.NODE_ENV === "development";

// Export the appropriate configuration
export const config: EnvironmentConfig = isDevelopment
  ? developmentConfig
  : productionConfig;

// Override with environment variables if they exist
export const environment = {
  API_BASE_URL: getEnvVar("EXPO_PUBLIC_API_BASE_URL", config.API_BASE_URL),
  DEBUG: getEnvVar("EXPO_PUBLIC_DEBUG", config.DEBUG.toString()) === "true",
  GOOGLE_MAPS_API_KEY: getEnvVar("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"),
};

// Log configuration in development
if (environment.DEBUG) {
  console.log("🔧 Environment Configuration:");
  console.log("  📍 API Base URL:", environment.API_BASE_URL);
  console.log("  🐛 Debug Mode:", environment.DEBUG);
  console.log(
    "  🔑 Google Maps API Key:",
    environment.GOOGLE_MAPS_API_KEY ? "Set" : "Not set"
  );
}
