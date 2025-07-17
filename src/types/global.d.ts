// Prototypes for global types
export {};

declare global {
  interface String {
    /**
     * Replace :<var> with fmt[<var>]
     * @param {Object} fmt
     * @returns {string}
     */
    format(fmt: Record<string, unknown>): string;
  }
  interface Number {
    /**
     * This method add k and M sufixes for positive and negative numbers
     * using `k` for kilo - according to https://www.nist.gov/pml/owm/metric-si-prefixes
     */
    kFormat(): string;
  }
}
