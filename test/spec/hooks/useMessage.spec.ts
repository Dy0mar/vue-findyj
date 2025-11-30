import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useMessage } from "src/hooks/useMessage";

const toast = {
  add: vi.fn(),
};

vi.mock("primevue/usetoast", () => ({
  useToast: () => toast,
}));

const TestComponent = defineComponent((props, ctx) => {
  const { successMessage, errorMessage } = useMessage();
  ctx.expose({ successMessage, errorMessage });
  return () => h("div");
});

describe("useMessage", () => {
  beforeEach(toast.add.mockReset);

  it.each([
    { callbackName: "successMessage", severity: "success" },
    { callbackName: "errorMessage", severity: "error" },
  ])("$callbackName show message with provided params", async ({ callbackName, severity }) => {
    const wrapper = mount(TestComponent);
    await wrapper.vm[callbackName]("Title", "Message");
    expect(toast.add).toHaveBeenCalledExactlyOnceWith({
      severity,
      summary: "Title",
      detail: "Message",
      life: 3000,
    });
  });
});
