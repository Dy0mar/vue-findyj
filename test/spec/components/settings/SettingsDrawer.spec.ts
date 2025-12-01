import { flushPromises } from "@vue/test-utils";
import { getRouter } from "vue-router-mock";
import { describe, expect, it, vi } from "vitest";
import { aMounter } from "test/utils/options";
import { AxiosResponseFactory } from "test/utils/factories/generic";
import { getByAriaLabel } from "test/utils/selector";
import { bus, EventNames } from "src/bus";
import { vacancyClient } from "src/api/client/vacancy";
import SettingsDrawer from "src/components/settings/SettingsDrawer.vue";

const response = new AxiosResponseFactory().create();
vi.spyOn(vacancyClient, "applyTitleStopWord").mockResolvedValue(response);
vi.spyOn(vacancyClient, "applyDescriptionStopWord").mockResolvedValue(response);

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

  it("should render the component", async () => {
    const wrapper = await render();
    expect(wrapper.exists()).toBe(true);
  });

  it("should be visible", async () => {
    const wrapper = await render({ props: { visible: false } });
    expect(wrapper.vm.visible).toBe(false);
    const drawer = wrapper.findComponent({ name: "Drawer" });
    expect(drawer.exists()).toBe(true);
    await drawer.vm.$emit("update:visible", true);
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
    const spy = vi.spyOn(vacancyClient, "applyTitleStopWord").mockResolvedValueOnce(response);
    const wrapper = await render();
    await getByAriaLabel(wrapper, title.apply).trigger("click");
    await flushPromises();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("should call applyDescriptionStopWord", async () => {
    const spy = vi.spyOn(vacancyClient, "applyDescriptionStopWord").mockResolvedValueOnce(response);
    const wrapper = await render();
    await getByAriaLabel(wrapper, description.apply).trigger("click");
    await flushPromises();
    expect(spy).toHaveBeenCalledOnce();
  });

  it("should call applyDescriptionStopWord with params", async () => {
    const spy = vi.spyOn(vacancyClient, "applyDescriptionStopWord").mockResolvedValueOnce(response);
    const wrapper = await render();
    const router = getRouter();
    await router.setQuery({ category: "foo" });
    await getByAriaLabel(wrapper, description.apply).trigger("click");
    await flushPromises();
    expect(spy).toHaveBeenCalledExactlyOnceWith({ data: { category: "foo" } });
  });
});
