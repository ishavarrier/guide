// Network utilities for mobile development
import { Platform } from "react-native";
import { environment } from "../config/environment";

/**
 * Get the appropriate API base URL based on the platform and environment
 */
export const getApiBaseUrl = (): string => {
  // In development, we need to handle different scenarios
  if (__DEV__) {
    // For Expo Go on physical device, we need to use the computer's IP address
    if (Platform.OS !== "web") {
      // Get IP from environment variable with fallback
      const DEVICE_IP = process.env.EXPO_PUBLIC_DEVICE_IP || "192.168.1.237";
      return `http://${DEVICE_IP}:8080/api/places`;
    }

    // For web development, use localhost
    return "http://localhost:8080/api/places";
  }

  // For production, use the configured URL
  return environment.API_BASE_URL;
};

/**
 * Get the computer's IP address for mobile development
 * This is a helper function to find your computer's IP
 */
export const getComputerIP = (): string => {
  // Get IP from environment variable with fallback
  const envIP = process.env.EXPO_PUBLIC_DEVICE_IP;
  if (envIP) return envIP;

  // Common IP addresses for development (fallback)
  const commonIPs = [
    "192.168.1.100",
    "192.168.0.100",
    "10.0.0.100",
    "172.20.10.2", // Common for iPhone hotspot
  ];

  // Return first common IP as fallback
  return commonIPs[0];
};

/**
 * Check if we're running on a physical device
 */
export const isPhysicalDevice = (): boolean => {
  return Platform.OS !== "web" && !__DEV__;
};

/**
 * Get network configuration info
 */
export const getNetworkInfo = () => {
  return {
    platform: Platform.OS,
    isDev: __DEV__,
    apiBaseUrl: getApiBaseUrl(),
    computerIP: getComputerIP(),
  };
};
