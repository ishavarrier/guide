/**
 * Haptic Feedback Utilities for React Native
 * Provides tactile feedback for user interactions using Expo Haptics
 */
import * as Haptics from 'expo-haptics';

// Light tap feedback (for button press, selection)
export function lightHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

// Medium feedback (for important actions, confirmations)
export function mediumHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

// Heavy feedback (for significant actions)
export function heavyHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

// Success feedback (for successful completion)
export function successHaptic(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

// Error feedback (for errors, invalid actions)
export function errorHaptic(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

// Warning feedback (for warnings)
export function warningHaptic(): void {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

// Selection feedback (for selecting items from a list)
export function selectionHaptic(): void {
  Haptics.selectionAsync();
}

// Impact feedback (for significant UI changes)
export function impactHaptic(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}



// Hook for easy integration in React components
export function useHaptics() {
  return {
    light: lightHaptic,
    medium: mediumHaptic,
    heavy: heavyHaptic,
    success: successHaptic,
    error: errorHaptic,
    warning: warningHaptic,
    selection: selectionHaptic,
    impact: impactHaptic,
  };
}
