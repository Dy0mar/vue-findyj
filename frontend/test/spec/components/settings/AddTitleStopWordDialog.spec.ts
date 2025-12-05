import { flushPromises, type VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sMounter } from "test/utils/options";
import { AxiosResponseFactory } from "test/utils/factories/generic";
import { bus, EventNames } from "src/bus";
import { stopWordsTitleClient } from "src/api/client/stop-words-title";
import AddTitleStopWordDialog from "src/components/settings/AddTitleStopWordDialog.vue";

const { successMessage } = vi.hoisted(() => {
  return {
    successMessage: vi.fn(),
  };
});

vi.mock("src/hooks/useMessage", () => ({
  useMessage: () => ({ successMessage }),
}));

const client = stopWordsTitleClient;
const response = new AxiosResponseFactory().create();
vi.spyOn(client, "create").mockResolvedValue(response);
vi.spyOn(client, "apply").mockResolvedValue(response);

describe("AddTitleStopWordDialog", () => {
  const render = sMounter(AddTitleStopWordDialog, { props: { visible: true } });

  afterEach(successMessage.mockReset);

  const dialogEmit = async (wrapper: VueWrapper, emitName: "save" | "apply", word: string, withApply?: boolean) => {
    const dialog = wrapper.findComponent({ name: "AddDialog" });
    dialog.vm.$emit(emitName, word, withApply);
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
    dialog.vm.$emit("update:visible", true);
    expect(wrapper.vm.visible).toBe(true);
  });

  describe("action save", () => {
    it("should call 'create' api function", async () => {
      const spy = vi.spyOn(client, "create").mockResolvedValueOnce(response);
      const wrapper = render();
      await dialogEmit(wrapper, "save", "foo");

      expect(spy).toHaveBeenCalledExactlyOnceWith({ data: { word: "foo" } });
    });

    it("should not call 'apply' api function", async () => {
      const spy = vi.spyOn(client, "apply").mockResolvedValueOnce(response);
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
      expect(successMessage).toHaveBeenCalledExactlyOnceWith("Title stop word", "Title stop word added successfully");
    });
  });

  describe("action apply", () => {
    it("should call 'apply' api function", async () => {
      const spy = vi.spyOn(client, "apply").mockResolvedValueOnce(response);
      const wrapper = render();
      await dialogEmit(wrapper, "apply", "foo", true);
      expect(spy).toHaveBeenCalledOnce();
    });

    it("should call bus event", async () => {
      const spy = vi.spyOn(bus, "emit");
      const wrapper = render({ visible: true });
      await dialogEmit(wrapper, "apply", "foo", true);
      expect(spy).toHaveBeenCalledExactlyOnceWith(EventNames.REFETCH_VACANCIES);
    });
  });
});
