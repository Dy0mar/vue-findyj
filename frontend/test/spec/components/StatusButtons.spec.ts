import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createRouterMock, injectRouterMock } from "vue-router-mock";
import { sMounter } from "test/utils/options";
import { getByAriaLabel } from "test/utils/selector";
import { VacancyStatus } from "src/constants";
import StatusButtons from "src/components/StatusButtons.vue";

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

describe("StatusButtons", () => {
  const router = createRouterMock();
  const render = sMounter(StatusButtons);

  beforeEach(() => {
    router.reset();
    injectRouterMock(router);
  });

  it("should mount successfully", async () => {
    const wrapper = await render();
    expect(wrapper.exists()).toBe(true);
  });

  describe("onMounted", () => {
    it.each(["wrong", undefined])("should set default status when query status is %s", async (status) => {
      await router.setQuery({ status });
      render();
      await flushPromises();
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({ status: VacancyStatus.NEW }),
      });
    });

    it("should set query param status", async () => {
      await router.setQuery({ status: VacancyStatus.APPLIED });
      render();
      await flushPromises();
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({ status: VacancyStatus.APPLIED }),
      });
    });
  });

  describe("Button", () => {
    it("should change query status on button click", async () => {
      const wrapper = render();

      // @ts-expect-error var statuses is private
      const label = wrapper.vm.statuses.find(({ status }) => status === VacancyStatus.APPLIED).label;
      await getByAriaLabel(wrapper, label).trigger("click");
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({ status: VacancyStatus.APPLIED }),
      });
    });
  });

  describe("Select", () => {
    it("should change query status on select", async () => {
      await router.setQuery({ status: VacancyStatus.NEW });
      const wrapper = render();
      await flushPromises();

      await wrapper.findComponent({ name: "Select" }).vm.$emit("update:modelValue", VacancyStatus.APPLIED);
      expect(router.replace).toBeCalledTimes(2);
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({ status: VacancyStatus.APPLIED }),
      });
    });
  });
});
