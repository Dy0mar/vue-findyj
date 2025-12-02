import { http } from "msw";
import { flushPromises } from "@vue/test-utils";
import { HttpResponse, server } from "test/utils/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bus, EventNames } from "src/bus";
import { authQuery } from "src/api/query/auth";
import { sMounter } from "test/utils/options";
import App from "src/App.vue";

describe("App", () => {
  const render = sMounter(App, {
    global: {
      stubs: {
        AppHeader: true,
        AppFooter: true,
        VacancyView: true,
        SettingsDrawer: true,
        AuthView: true,
        Toast: true,
        VueQueryDevtools: true,
      },
    },
  });

  beforeAll(() => {
    server.use(
      http.get(authQuery.client.path.check(), () => {
        return HttpResponse.json({ message: "ok" });
      }),
    );
  });

  afterAll(() => {
    bus.all.clear();
  });

  it("should render the component", () => {
    const wrapper = render();
    expect(wrapper.exists()).toBe(true);
  });

  it("should has loading", () => {
    const wrapper = render();
    expect(wrapper.text()).contain("Loading...");
  });

  it("should has toast component", () => {
    const wrapper = render();
    expect(wrapper.findComponent({ name: "Toast" }).exists()).toBe(true);
  });

  it("should mount app components", async () => {
    const wrapper = render();
    await flushPromises();
    expect(wrapper.findComponent({ name: "AppLayout" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "VacancyView" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "SettingsDrawer" }).exists()).toBe(true);
  });

  it("settings should change local visible", async () => {
    const wrapper = render();
    await flushPromises();
    wrapper.findComponent({ name: "SettingsDrawer" }).vm.$emit("update:visible", true);
    // @ts-expect-error private property
    expect(wrapper.vm.visible).toBe(true);
  });

  it("bus event should close the settings", async () => {
    const wrapper = render();
    await flushPromises();
    bus.emit(EventNames.OPEN_SETTINGS);
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: "SettingsDrawer" }).props("visible")).toBe(true);
  });

  describe("auth", () => {
    beforeAll(() => {
      server.use(
        http.get(authQuery.client.path.check(), () => {
          return HttpResponse.json({ error: { name: "AuthError", message: "Invalid credentials" } }, { status: 401 });
        }),
      );
    });

    it("should mount AuthView when 401", async () => {
      const wrapper = render();
      await flushPromises();
      expect(wrapper.findComponent({ name: "AuthView" }).exists()).toBe(true);
    });
  });
});
