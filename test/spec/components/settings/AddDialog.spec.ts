import { describe, expect, it } from "vitest";
import { aMounter } from "test/utils/options";
import { getByAriaLabel } from "test/utils/selector";
import AddDialog from "src/components/settings/AddDialog.vue";

describe("AddDialog", () => {
  const options = { props: { header: "Test Header", visible: true } };
  const render = aMounter(AddDialog, options, async (wrapper) => {
    if (wrapper) {
      await wrapper.vm.$nextTick();
    }
  });

  it("should render the component", async () => {
    const wrapper = await render();
    expect(wrapper.exists()).toBe(true);
  });

  it.each(["Cancel", "Save", "Save and apply"])("has button '%s'", async (label) => {
    const wrapper = await render();
    expect(getByAriaLabel(wrapper, label).exists()).toBe(true);
  });

  it("should update name input value", async () => {
    const wrapper = await render();
    const input = wrapper.find("input");
    await input.setValue("test name");
    expect(input.element.value).toBe("test name");
  });

  it("should close dialog on Cancel button click", async () => {
    const wrapper = await render();
    await getByAriaLabel(wrapper, "Cancel").trigger("click");
    expect(wrapper.emitted("update:visible")?.[0]).toEqual([false]);
  });

  it.each([
    { emitName: "save", label: "Save" },
    { emitName: "apply", label: "Save and apply" },
  ])("should emit $emitName event with value when click on $label", async ({ emitName, label }) => {
    const wrapper = await render();
    await wrapper.find("input").setValue("test name");
    await getByAriaLabel(wrapper, label).trigger("click");
    expect(wrapper.emitted(emitName)?.[0]).toEqual(["test name"]);
  });
});
