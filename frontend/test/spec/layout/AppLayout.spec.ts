import { flushPromises } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { sMounter } from "test/utils/options";
import { bus, EventNames } from "src/bus";
import AppLayout from "src/layout/AppLayout.vue";

describe("AppLayout", () => {
  const render = sMounter(AppLayout, { shallow: true });

  it("should mount successfully", () => {
    const wrapper = render();
    expect(wrapper.exists()).toBe(true);
  });

  it("settings should change local visible", async () => {
    const wrapper = render();
    await flushPromises();
    wrapper.findComponent({ name: "SettingsDrawer" }).vm.$emit("update:visible", true);
    // @ts-expect-error private property
    expect(wrapper.vm.visible).toBe(true);
  });

  it("bus event should close the settings", async () => {
    const wrapper = render();
    await flushPromises();
    bus.emit(EventNames.OPEN_SETTINGS);
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: "SettingsDrawer" }).props("visible")).toBe(true);
  });
});
