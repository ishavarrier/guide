import { Dimensions } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

// iPhone 16 Pro specific dimensions
export const IS_IPHONE_16_PRO = SCREEN_HEIGHT === 2622 || SCREEN_WIDTH === 1206;

// Safe area constants for iPhone 16 Pro
export const SAFE_AREA_TOP = 59; // Dynamic Island height
export const SAFE_AREA_BOTTOM = 34; // Home indicator height

// Common breakpoints for responsive design
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// iPhone 16 Pro specific layout constants
export const LAYOUT = {
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 83,
  CARD_PADDING: 16,
  SECTION_SPACING: 24,
} as const;
