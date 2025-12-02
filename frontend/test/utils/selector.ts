import type { VueWrapper } from "@vue/test-utils";
import { expect } from "vitest";

/**
 * Finds the DOM element with the given aria-label value in the provided VueWrapper.
 *
 * @param wrapper - The VueWrapper instance to search within.
 * @param value - The value of the label to search for.
 * @returns The DOMWrapper object representing the found element.
 */
export function getByAriaLabel(wrapper: VueWrapper, value: string) {
  const element = wrapper.find(`[aria-label='${value}']`);
  expect(element).toBeDefined();
  return element;
}
