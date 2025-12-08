import { describe, expect, it } from "vitest";
import { sMounter } from "test/utils/options";
import App from "src/App.vue";

describe("App", () => {
  const render = sMounter(App, { shallow: true });

  it("should render the component", () => {
    const wrapper = render();
    expect(wrapper.exists()).toBe(true);
  });

  it.each(["Toast", "RouterView"])("should has %s component", (name) => {
    const wrapper = render();
    expect(wrapper.findComponent({ name }).exists()).toBe(true);
  });
});
