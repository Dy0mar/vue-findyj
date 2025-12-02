import { shallowMount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppLayout from "src/layout/AppLayout.vue";

describe("AppLayout", () => {
  it("should mount successfully", () => {
    const wrapper = shallowMount(AppLayout);
    expect(wrapper.exists()).toBe(true);
  });

  it("should render default slot content", () => {
    const slotContent = '<div class="test-content">Test Content</div>';
    const wrapper = shallowMount(AppLayout, {
      slots: {
        default: slotContent,
      },
    });
    expect(wrapper.html()).toContain(slotContent);
  });

  it("should render slot content in main section", () => {
    const slotContent = '<div class="test-content">Test Content</div>';
    const wrapper = shallowMount(AppLayout, {
      slots: {
        default: slotContent,
      },
    });
    expect(wrapper.find("main").html()).toContain(slotContent);
  });
});
