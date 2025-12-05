/**
 * Haptic Feedback Utilities for Mobile Devices
 * Provides tactile feedback for user interactions
 */

// Check if haptic feedback is supported
export function isHapticsSupported(): boolean {
  return 'vibrate' in navigator;
}

// Light tap feedback (for button press, selection)
export function lightHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate(10);
  }
}

// Medium feedback (for important actions, confirmations)
export function mediumHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate(20);
  }
}

// Success feedback (for successful completion)
export function successHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate([10, 50, 10]);
  }
}

// Error feedback (for errors, invalid actions)
export function errorHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate([20, 50, 20, 50, 20]);
  }
}

// Selection feedback (for selecting items from a list)
export function selectionHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate(5);
  }
}

// Impact feedback (for significant UI changes)
export function impactHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate(15);
  }
}

/**
 * Usage Examples:
 * 
 * // On button click
 * <button onClick={() => {
 *   lightHaptic();
 *   handleClick();
 * }}>Click Me</button>
 * 
 * // On form submission success
 * const handleSubmit = async () => {
 *   try {
 *     await submitForm();
 *     successHaptic();
 *   } catch (error) {
 *     errorHaptic();
 *   }
 * }
 * 
 * // On selecting a friend
 * const toggleFriend = (id) => {
 *   selectionHaptic();
 *   setSelected(prev => /* ... *\/);
 * }
 */

// Hook for easy integration in React components
export function useHaptics() {
  return {
    light: lightHaptic,
    medium: mediumHaptic,
    success: successHaptic,
    error: errorHaptic,
    selection: selectionHaptic,
    impact: impactHaptic,
    isSupported: isHapticsSupported(),
  };
}
