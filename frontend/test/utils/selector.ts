import { DOMWrapper, type VueWrapper } from "@vue/test-utils";
import { expect } from "vitest";

type WrapperSelector = VueWrapper | DOMWrapper<Element>;
/**
 * Finds the DOM element with the given aria-label value in the provided VueWrapper.
 *
 * @param wrapper - The VueWrapper instance to search within.
 * @param value - The value of the aria-label to search for.
 * @returns The DOMWrapper object representing the found element.
 */
export function getByAriaLabel(wrapper: WrapperSelector, value: string) {
  const element = wrapper.find(`[aria-label='${value}']`);
  expect(element).toBeDefined();
  return element;
}

/**
 * Finds the DOM element with the given role value in the provided VueWrapper.
 *
 * @param wrapper - The VueWrapper instance to search within.
 * @param value - The value of the role to search for.
 * @returns The DOMWrapper object representing the found element.
 */
export function getByRole(wrapper: WrapperSelector, value: string) {
  const element = wrapper.find(`[role='${value}']`);
  expect(element).toBeDefined();
  return element;
}
