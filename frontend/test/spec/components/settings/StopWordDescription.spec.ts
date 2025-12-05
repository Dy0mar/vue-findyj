import { http } from "msw";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { HttpResponse, server } from "test/utils/server";
import { aMounter } from "test/utils/options";
import { StopWordFactory } from "test/utils/factories/vacancy";
import { stopWordsDescriptionQuery } from "src/api/query/stop-words-description";
import StopWordDescription from "src/components/settings/StopWordDescription.vue";

const { successMessage } = vi.hoisted(() => {
  return {
    successMessage: vi.fn(),
  };
});

vi.mock("src/hooks/useMessage", () => ({
  useMessage: () => ({ successMessage }),
}));

describe("StopWordDescription", () => {
  const query = stopWordsDescriptionQuery;
  const words = new StopWordFactory().batch(2);
  const word = words[0]!;

  const render = aMounter(StopWordDescription, { props: { visible: true } }, async (wrapper) => {
    if (wrapper) {
      await flushPromises();
      await wrapper.vm.$nextTick();
    }
  });

  afterEach(successMessage.mockReset);

  beforeAll(() => {
    server.use(
      http.get(query.client.path.list(), () => {
        return HttpResponse.json(words);
      }),
      http.delete(query.client.path.detail({ id: word.id }), () => {
        return HttpResponse.json(undefined, { status: 204 });
      }),
    );
  });

  it("should render the component", async () => {
    const wrapper = await render();
    expect(wrapper.exists()).toBe(true);
  });

  it("should pass items to the component", async () => {
    const wrapper = await render();
    expect(wrapper.findComponent({ name: "StopWordDriver" }).props("items")).toStrictEqual(words);
  });

  it("should change model:visible", async () => {
    const wrapper = await render();
    const sidebar = wrapper.findComponent({ name: "StopWordDriver" });
    sidebar.vm.$emit("update:visible", true);
    expect(wrapper.vm.visible).toBe(true);
  });

  it("should call api func on delete", async () => {
    const spy = vi.spyOn(query.client, "delete");
    const wrapper = await render();
    const sidebar = wrapper.findComponent({ name: "StopWordDriver" });
    sidebar.vm.$emit("remove", word);
    await flushPromises();
    expect(spy).toHaveBeenCalledExactlyOnceWith({ params: { id: word.id } });
  });

  it("should call successMessage", async () => {
    const wrapper = await render();
    const sidebar = wrapper.findComponent({ name: "StopWordDriver" });
    sidebar.vm.$emit("remove", word);
    await flushPromises();
    expect(successMessage).toHaveBeenCalledExactlyOnceWith("Removed", "Item has been removed");
  });
});
