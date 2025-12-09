import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRouterMock, injectRouterMock } from "vue-router-mock";
import { sMounter } from "test/utils/options";
import { getByAriaLabel } from "test/utils/selector";
import CategoryButtons from "src/components/CategoryButtons.vue";

// fixme: Select matchMedia is not a function workaround
// fixme: update primevue, check and remove it
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("CategoryButtons", () => {
  const router = createRouterMock();
  const categories = ["foo", "bar"];
  const render = sMounter(CategoryButtons, { props: { categories } });

  beforeEach(() => {
    router.reset();
    injectRouterMock(router);
  });

  it("should mount successfully", async () => {
    const wrapper = render();
    expect(wrapper.exists()).toBe(true);
  });

  it("should init from query param category", async () => {
    await router.setQuery({ category: "bar" });
    const wrapper = render({ props: { categories: [] } });
    await wrapper.setProps({ categories });
    expect(wrapper.findComponent({ name: "Select" }).props("modelValue")).toBe("bar");
  });

  describe("Button", () => {
    it("should change query category on button click", async () => {
      const wrapper = render();

      const category = categories[0]!;
      await getByAriaLabel(wrapper, category).trigger("click");
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({ category }),
      });
    });
  });

  describe("Select", () => {
    it("should change query category on select", async () => {
      const wrapper = render();

      await wrapper.findComponent({ name: "Select" }).vm.$emit("update:modelValue", categories[0]);
      await flushPromises();
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({ category: "foo" }),
      });
    });
  });
});
