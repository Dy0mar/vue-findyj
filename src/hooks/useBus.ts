import { inject } from "vue";
import { EmitterKey } from "src/symbols";

// For convenience, usually you want to import EventNames from this file.
export { EventNames } from "src/bus";

/**
 * Returns the event bus.
 * @example
 * import { useBus, EventNames } from "src/utils/hooks";
 * const bus = useBus();
 * bus.emit(EventNames.BACKDROP, true);
 * // or
 * bus.on(EventNames.BACKDROP, () => {
 *   // implementation
 * });
 */
export function useBus() {
  return inject(EmitterKey)!;
}
