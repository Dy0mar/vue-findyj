import { http } from "msw";
import { flushPromises } from "@vue/test-utils";
import { getRouter } from "vue-router-mock";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { HttpResponse, server } from "test/utils/server";
import { aMounter } from "test/utils/options";
import { AxiosResponseFactory } from "test/utils/factories/generic";
import { getByAriaLabel } from "test/utils/selector";
import { bus, EventNames } from "src/bus";
import { stopWordsTitleClient } from "src/api/client/stop-words-title";
import { stopWordsDescriptionClient } from "src/api/client/stop-words-description";
import SettingsDrawer from "src/components/settings/SettingsDrawer.vue";

const response = new AxiosResponseFactory().create();
vi.spyOn(stopWordsTitleClient, "apply").mockResolvedValue(response);
vi.spyOn(stopWordsDescriptionClient, "apply").mockResolvedValue(response);

describe("SettingsDrawer", () => {
  const title = {
    add: "Add title stop word",
    apply: "Apply title stop word",
  };
  const description = {
    add: "Add description stop word",
    apply: "Apply description stop word",
  };

  const render = aMounter(SettingsDrawer, { props: { visible: true } }, async (wrapper) => {
    if (wrapper) {
      await wrapper.vm.$nextTick();
    }
  });

  beforeAll(() => {
    server.use(
      http.get(stopWordsTitleClient.path.list(), () => {
        return HttpResponse.json([]);
      }),
      http.get(stopWordsDescriptionClient.path.list(), () => {
        return HttpResponse.json([]);
      }),
    );
  });

  it("should render the component", async () => {
    const wrapper = await render();
    expect(wrapper.exists()).toBe(true);
  });

  it("should be visible", async () => {
    const wrapper = await render({ props: { visible: false } });
    expect(wrapper.vm.visible).toBe(false);
    const drawer = wrapper.findComponent({ name: "Drawer" });
    expect(drawer.exists()).toBe(true);
    drawer.vm.$emit("update:visible", true);
    expect(wrapper.vm.visible).toBe(true);
  });

  it.each([
    { name: "AddTitleStopWordDialog", property: "isAddTitleStopWordVisible" },
    { name: "AddDescriptionStopWordDialog", property: "isAddDescriptionStopWordVisible" },
  ] as const)("$name should change private property", async ({ name, property }) => {
    const wrapper = await render();
    const dialog = wrapper.findComponent({ name });
    expect(dialog.exists()).toBe(true);
    dialog.vm.$emit("update:visible", true);
    // @ts-expect-error the property is private
    expect(wrapper.vm[property]).toBe(true);
  });

  it.each([
    { name: "AddTitleStopWordDialog", label: title.add },
    { name: "AddDescriptionStopWordDialog", label: description.add },
  ])("should open $name", async ({ name, label }) => {
    const wrapper = await render();
    await getByAriaLabel(wrapper, label).trigger("click");
    const dialog = wrapper.findComponent({ name });
    expect(dialog.exists()).toBe(true);
    expect(dialog.props()).toHaveProperty("visible", true);
    expect(dialog.props("visible")).toBe(true);
  });

  it.each([
    { methodName: "applyTitleStopWord", label: title.apply },
    { methodName: "applyDescriptionStopWord", label: description.apply },
  ] as const)("should call bus event after called $methodName", async ({ label }) => {
    const spy = vi.spyOn(bus, "emit");
    const wrapper = await render();
    await getByAriaLabel(wrapper, label).trigger("click");
    expect(spy).toHaveBeenCalledExactlyOnceWith(EventNames.REFETCH_VACANCIES);
  });

  it("should call applyTitleStopWord", async () => {
    const spy = vi.spyOn(stopWordsTitleClient, "apply").mockResolvedValueOnce(response);
    const wrapper = await render();
    await getByAriaLabel(wrapper, title.apply).trigger("click");
    await flushPromises();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("should call applyDescriptionStopWord", async () => {
    const spy = vi.spyOn(stopWordsDescriptionClient, "apply").mockResolvedValueOnce(response);
    const wrapper = await render();
    await getByAriaLabel(wrapper, description.apply).trigger("click");
    await flushPromises();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("should call applyDescriptionStopWord with params", async () => {
    const spy = vi.spyOn(stopWordsDescriptionClient, "apply").mockResolvedValueOnce(response);
    const wrapper = await render();
    const router = getRouter();
    await router.setQuery({ category: "foo" });
    await getByAriaLabel(wrapper, description.apply).trigger("click");
    await flushPromises();
    expect(spy).toHaveBeenCalledExactlyOnceWith({ data: { category: "foo" } });
  });

  it.each([
    { label: "Show title stop words", name: "StopWordTitle" },
    { label: "Show description stop words", name: "StopWordDescription" },
  ])("should open $name sidebar", async ({ name, label }) => {
    const wrapper = await render();
    await getByAriaLabel(wrapper, label).trigger("click");
    expect(wrapper.findComponent({ name }).props("visible")).toBe(true);
  });

  it.each([
    { prop: "isShowTitleList", name: "StopWordTitle" },
    { prop: "isShowDescriptionList", name: "StopWordDescription" },
  ])("can change local $prop property", async ({ name, prop }) => {
    const wrapper = await render();
    wrapper.findComponent({ name }).vm.$emit("update:visible", true);
    // @ts-expect-error the property is private
    expect(wrapper.vm[prop]).toBe(true);
  });
});
