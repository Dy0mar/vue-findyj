/**
 * Checks if the current viewport width indicates a mobile device.
 * Note: This function is not reactive to window resizes.
 */
export function isMobile() {
  return window.innerWidth < 640;
}
