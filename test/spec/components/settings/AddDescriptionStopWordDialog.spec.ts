import { flushPromises, type VueWrapper } from "@vue/test-utils";
import { getRouter } from "vue-router-mock";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sMounter } from "test/utils/options";
import { AxiosResponseFactory } from "test/utils/factories/generic";
import { bus, EventNames } from "src/bus";
import { vacancyClient } from "src/api/client/vacancy";
import AddDescriptionStopWordDialog from "src/components/settings/AddDescriptionStopWordDialog.vue";

const { successMessage } = vi.hoisted(() => {
  return {
    successMessage: vi.fn(),
  };
});

vi.mock("src/hooks/useMessage", () => ({
  useMessage: () => ({ successMessage }),
}));

const response = new AxiosResponseFactory().create();
vi.spyOn(vacancyClient, "addDescriptionStopWord").mockResolvedValue(response);
vi.spyOn(vacancyClient, "applyDescriptionStopWord").mockResolvedValue(response);

describe("AddDescriptionStopWordDialog", () => {
  const render = sMounter(AddDescriptionStopWordDialog, { props: { visible: true } });

  afterEach(successMessage.mockReset);

  const dialogEmit = async (wrapper: VueWrapper, emitName: "save" | "apply", word: string, withApply?: boolean) => {
    const dialog = wrapper.findComponent({ name: "AddDialog" });
    await dialog.vm.$emit(emitName, word, withApply);
    await flushPromises();
  };

  it("should render the component", () => {
    const wrapper = render();
    expect(wrapper.exists()).toBe(true);
  });

  it("should be visible", async () => {
    const wrapper = render({ props: { visible: false } });
    expect(wrapper.vm.visible).toBe(false);
    const dialog = wrapper.findComponent({ name: "AddDialog" });
    await dialog.vm.$emit("update:visible", true);
    expect(wrapper.vm.visible).toBe(true);
  });

  describe("action save", () => {
    it("should call 'add' api function", async () => {
      const spy = vi.spyOn(vacancyClient, "addDescriptionStopWord").mockResolvedValueOnce(response);
      const wrapper = render();
      await dialogEmit(wrapper, "save", "foo");

      expect(spy).toHaveBeenCalledExactlyOnceWith({ data: { word: "foo" } });
    });

    it("should not call 'apply' api function", async () => {
      const spy = vi.spyOn(vacancyClient, "applyDescriptionStopWord").mockResolvedValueOnce(response);
      const wrapper = render();
      await dialogEmit(wrapper, "save", "foo");
      expect(spy).not.toHaveBeenCalled();
    });

    it("should not call bus event", async () => {
      const spy = vi.spyOn(bus, "emit");
      const wrapper = render({ visible: true });
      await dialogEmit(wrapper, "save", "foo");
      expect(spy).not.toHaveBeenCalled();
    });

    it("should call successMessage", async () => {
      const wrapper = render({ visible: true });
      await dialogEmit(wrapper, "save", "foo");
      expect(successMessage).toHaveBeenCalledExactlyOnceWith(
        "Description stop word",
        "Description stop word added successfully",
      );
    });
  });

  describe("action apply", () => {
    it("should call 'apply' api function", async () => {
      const spy = vi.spyOn(vacancyClient, "applyDescriptionStopWord").mockResolvedValueOnce(response);
      const wrapper = render();
      await dialogEmit(wrapper, "apply", "foo", true);
      expect(spy).toHaveBeenCalledExactlyOnceWith();
    });

    it("should call 'apply' only for the category", async () => {
      const spy = vi.spyOn(vacancyClient, "applyDescriptionStopWord").mockResolvedValueOnce(response);
      const wrapper = render();
      const router = getRouter();
      await router.setQuery({ category: "bar" });
      await dialogEmit(wrapper, "apply", "foo", true);
      expect(spy).toHaveBeenCalledExactlyOnceWith({ data: { category: "bar" } });
    });

    it("should call bus event", async () => {
      const spy = vi.spyOn(bus, "emit");
      const wrapper = render({ visible: true });
      await dialogEmit(wrapper, "apply", "foo", true);
      expect(spy).toHaveBeenCalledExactlyOnceWith(EventNames.REFETCH_VACANCIES);
    });
  });
});
