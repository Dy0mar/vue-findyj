import { flushPromises, mount, type VueWrapper } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginView from "src/views/auth/LoginView.vue";

const toast = {
  add: vi.fn(),
};

vi.mock("primevue/usetoast", () => ({
  useToast: vi.fn(() => toast),
}));

let resolveSignIn: (evt: { error: null | { name: string; message: string } }) => void;

vi.mock("@supabase/supabase-js", () => {
  const signInWithPasswordMock = vi.fn(() => {
    return new Promise((resolve) => {
      resolveSignIn = resolve;
    });
  });

  const mockClient = {
    auth: {
      signInWithPassword: signInWithPasswordMock,
    },
  };
  return { createClient: vi.fn(() => mockClient) };
});

describe("LoginView", () => {
  describe("state", () => {
    it("renders the login button correctly on initial load", () => {
      const wrapper = mount(LoginView);
      const submitButton = wrapper.findComponent({ name: "Button" });

      expect(submitButton.exists()).toBe(true);
      expect(submitButton.props("loading")).toBe(false);
      expect(submitButton.props("disabled")).toBeFalsy();
    });

    it("renders the input login correctly on initial load", () => {
      const wrapper = mount(LoginView);

      const usernameInput = wrapper.findComponent({ name: "InputText" });
      expect(usernameInput.exists()).toBe(true);
      expect(usernameInput.props("disabled")).toBeFalsy();
    });

    it("renders the input password correctly on initial load", () => {
      const wrapper = mount(LoginView);

      const passwordInput = wrapper.findComponent({ name: "Password" });
      expect(passwordInput.exists()).toBe(true);
      expect(passwordInput.props("disabled")).toBeFalsy();
    });

    it("updates form data when user types in inputs", async () => {
      const wrapper = mount(LoginView);

      const usernameInput = wrapper.find("input#email");
      const passwordInput = wrapper.find("input#password");

      await Promise.all([usernameInput.setValue("test@example.com"), passwordInput.setValue("password123")]);

      // @ts-expect-error form is private
      expect(wrapper.vm.login).toBe("test@example.com");
      // @ts-expect-error form is private
      expect(wrapper.vm.password).toBe("password123");
    });
  });

  describe("submit", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    const submitForm = async (wrapper: VueWrapper) => {
      await Promise.all([
        wrapper.find("input#email").setValue("test@example.com"),
        wrapper.find("input#password").setValue("password123"),
      ]);
      await wrapper.find("form").trigger("submit.prevent");
    };

    it("loading should toggles", async () => {
      const wrapper = mount(LoginView);
      const submitButton = wrapper.findComponent({ name: "Button" });

      await submitForm(wrapper);

      expect(submitButton.props("loading")).toBe(true);
      resolveSignIn({ error: null });
      await flushPromises();
      expect(submitButton.props("loading")).toBe(false);
    });

    it("should navigates on success", async () => {
      Object.defineProperty(window, "location", {
        value: {
          href: "http://localhost:3000/",
          assign: vi.fn(),
        },
        writable: true,
      });

      const wrapper = mount(LoginView);

      await submitForm(wrapper);
      resolveSignIn({ error: null });
      await flushPromises();
      expect(window.location.assign).toHaveBeenCalledExactlyOnceWith("/");
    });

    it("should call toast on error", async () => {
      const wrapper = mount(LoginView);

      await submitForm(wrapper);
      resolveSignIn({ error: { name: "AuthError", message: "Invalid credentials" } });
      await flushPromises();
      expect(toast.add).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          severity: "error",
          summary: "AuthError",
          detail: "Invalid credentials",
          life: 3000,
        }),
      );
    });
  });
});
