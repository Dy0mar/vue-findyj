import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AuthView from "src/views/auth/AuthView.vue";

describe("AuthView", () => {
  it("should render the component", () => {
    const wrapper = mount(AuthView);
    expect(wrapper.exists()).toBe(true);
  });

  it("should has RouterView", () => {
    const wrapper = mount(AuthView);
    expect(wrapper.findComponent({ name: "RouterView" }).exists()).toBe(true);
  });
});
