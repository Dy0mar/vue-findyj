import { describe, expect, it } from "vitest";
import { aMounter } from "test/utils/options";
import { StopWordFactory } from "test/utils/factories/vacancy";
import { getByAriaLabel, getByRole } from "test/utils/selector";
import StopWordDriver from "src/components/settings/StopWordDriver.vue";

describe("StopWordDriver", () => {
  const items = new StopWordFactory().batch(2);
  const render = aMounter(
    StopWordDriver,
    { props: { visible: false, header: "Header Test", items } },
    async (wrapper) => {
      if (wrapper) {
        await wrapper.vm.$nextTick();
      }
    },
  );

  it("should render the component", async () => {
    const wrapper = await render();
    expect(wrapper.exists()).toBe(true);
  });

  it("should emit visible", async () => {
    const wrapper = await render();
    wrapper.findComponent({ name: "Drawer" }).vm.$emit("update:visible", true);
    expect(wrapper.emitted("update:visible")).toStrictEqual([[true]]);
  });

  it("should render the items", async () => {
    const wrapper = await render({ props: { visible: true } });
    expect(wrapper.findAll("li").length).toBe(items.length);
  });

  it("should show alertdialog", async () => {
    const wrapper = await render({ props: { visible: true } });
    await getByAriaLabel(wrapper, "ConfirmDelete").trigger("click");
    expect(getByRole(wrapper, "alertdialog").exists()).toBeTruthy();
  });

  it("should emit event on delete", async () => {
    const wrapper = await render({ props: { visible: true } });
    await getByAriaLabel(wrapper, "ConfirmDelete").trigger("click");
    const dialog = getByRole(wrapper, "alertdialog");
    await getByAriaLabel(dialog, "Delete").trigger("click");
    expect(wrapper.emitted("remove")).toStrictEqual([[items[0]]]);
  });
});
