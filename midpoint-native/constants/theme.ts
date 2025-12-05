/**
 * Theme Constants
 * 
 * This file exports all color values from the Tailwind config.
 * Use these constants instead of hardcoded colors throughout the app.
 * This ensures consistency and makes it easy to update colors in one place.
 */

// Color palette from tailwind.config.js
export const colors = {
  // Primary brand color - Warm tan
  primary: '#E2A16F',
  primaryForeground: '#ffffff',
  
  // Secondary brand color - Muted blue
  secondary: '#86B0BD',
  secondaryForeground: '#ffffff',
  
  // Background colors
  background: '#FFF0DD',  // Cream
  card: '#ffffff',
  
  // Text colors
  foreground: '#1e293b',
  cardForeground: '#1e293b',
  mutedForeground: '#64748b',
  
  // Muted colors
  muted: '#D1D3D4',  // Light gray
  
  // Accent colors
  accent: '#86B0BD',
  accentForeground: '#ffffff',
  
  // Status colors
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  
  // Border and input
  border: '#D1D3D4',
  input: 'transparent',
  inputBackground: '#ffffff',
  
  // Ring (focus states)
  ring: '#E2A16F',
  
  // Gradients for LinearGradient components
  gradients: {
    background: ['#FFF0DD', '#D1D3D4'] as const,  // Cream to gray
    header: ['#E2A16F', '#86B0BD'] as const,  // Tan to blue
    accent: ['#86B0BD', '#E2A16F'] as const,  // Blue to tan
  },
  
  // Chart colors
  chart: {
    '1': '#E2A16F',  // Tan
    '2': '#86B0BD',  // Blue
    '3': '#D1D3D4',  // Gray
    '4': '#FFF0DD',  // Cream
    '5': '#1e293b',  // Dark gray
  },
  
  // Common colors used in the app
  white: '#ffffff',
  black: '#000000',
  
  // Icon colors (mapped to theme colors)
  icon: {
    primary: '#E2A16F',
    secondary: '#86B0BD',
    muted: '#64748b',
    foreground: '#1e293b',
    white: '#ffffff',
  },
} as const;

// Opacity variants for colors (for rgba usage)
export const colorOpacity = {
  primary: {
    '10': 'rgba(226, 161, 111, 0.1)',
    '20': 'rgba(226, 161, 111, 0.2)',
    '30': 'rgba(226, 161, 111, 0.3)',
    '50': 'rgba(226, 161, 111, 0.5)',
    '80': 'rgba(226, 161, 111, 0.8)',
  },
  secondary: {
    '10': 'rgba(134, 176, 189, 0.1)',
    '20': 'rgba(134, 176, 189, 0.2)',
    '30': 'rgba(134, 176, 189, 0.3)',
    '50': 'rgba(134, 176, 189, 0.5)',
    '80': 'rgba(134, 176, 189, 0.8)',
  },
  white: {
    '20': 'rgba(255, 255, 255, 0.2)',
    '80': 'rgba(255, 255, 255, 0.8)',
  },
} as const;

