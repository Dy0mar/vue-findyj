import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { bus, EventNames } from "src/bus";
import AppFooter from "src/layout/AppFooter.vue";

describe("AppFooter", () => {

  it("should mount successfully", () => {
    const wrapper = mount(AppFooter);
    expect(wrapper.exists()).toBe(true);
  });

  it("should have initial count of 0", () => {
    const wrapper = mount(AppFooter);
    expect(wrapper.text()).toContain("Vacancies: 0");
  });

  it("should update count when receiving COUNT_VACANCIES event", async () => {
    const wrapper = mount(AppFooter);
    bus.emit(EventNames.COUNT_VACANCIES, 42);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Vacancies: 42");
  });

  it("should display current year", () => {
    const wrapper = mount(AppFooter);
    const currentYear = new Date().getFullYear();
    expect(wrapper.text()).toContain(`${currentYear}`);
  });
});
