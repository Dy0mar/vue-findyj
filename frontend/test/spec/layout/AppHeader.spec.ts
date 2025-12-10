import { http } from "msw";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createRouterMock, injectRouterMock } from "vue-router-mock";
import { bus, EventNames } from "src/bus";
import { VacancyStatus } from "src/constants";
import { crawlerClient } from "src/api/client/crawler";
import { categoryClient } from "src/api/client/category";
import { CategoryFactory } from "test/utils/factories/category";
import { HttpResponse, server } from "test/utils/server";
import { aMounter } from "test/utils/options";
import { AxiosResponseFactory } from "test/utils/factories/generic";
import { getByAriaLabel } from "test/utils/selector";
import AppHeader from "src/layout/AppHeader.vue";

vi.spyOn(crawlerClient, "runParse");

// fixme: Select matchMedia is not a function workaround
// fixme: update primevue, check and remove it
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("AppHeader", () => {
  const router = createRouterMock();
  const categories = new CategoryFactory().batch(1);
  const render = aMounter(AppHeader, {}, async (wrapper) => {
    if (wrapper) {
      await flushPromises();
      await wrapper.vm.$nextTick();
    }
  });

  beforeAll(() => {
    server.use(
      http.get(categoryClient.path.list(), () => {
        return HttpResponse.json(categories);
      }),
    );
  });

  beforeEach(() => {
    router.reset();
    injectRouterMock(router);
  });

  it("should mount successfully", async () => {
    const wrapper = await render();
    expect(wrapper.exists()).toBe(true);
  });

  it("button labels should be hide when device is mobile", async () => {
    const original = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { writable: true, value: 500 });
    const wrapper = await render();
    expect(getByAriaLabel(wrapper, "settings").exists()).toBe(false);
    expect(getByAriaLabel(wrapper, "Fetch new").exists()).toBe(false);
    Object.defineProperty(window, "innerWidth", { writable: true, value: original });
  });

  describe("search", () => {
    it("should have empty initial search term", async () => {
      const wrapper = await render();
      const searchInput = wrapper.find<HTMLInputElement>('input[placeholder="Search"]');
      expect(searchInput.element.value).toBe("");
    });

    it("should update router query when search term changes", async () => {
      vi.useFakeTimers();
      const wrapper = await render();
      const searchInput = wrapper.find<HTMLInputElement>('input[placeholder="Search"]');
      await searchInput.setValue("test search");
      await vi.runAllTimersAsync();
      expect(router.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ search: "test search" }),
        }),
      );
      vi.useRealTimers();
    });

    it("should clear query when search term changes from value to empty value", async () => {
      vi.useFakeTimers();
      const wrapper = await render();
      const searchInput = wrapper.find<HTMLInputElement>('input[placeholder="Search"]');
      await searchInput.setValue("test search");
      await vi.runAllTimersAsync();
      await searchInput.setValue("");
      await vi.runAllTimersAsync();
      expect(router.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ search: undefined }),
        }),
      );
      vi.useRealTimers();
    });
  });

  it("should emit event when settings button is clicked", async () => {
    const wrapper = await render();
    const spy = vi.spyOn(bus, "emit");
    await getByAriaLabel(wrapper, "settings").trigger("click");
    expect(spy).toHaveBeenCalledWith(EventNames.OPEN_SETTINGS);
  });

  describe("query params", () => {
    it("should not set query status on mounted if query has status already", async () => {
      await router.setQuery({ status: VacancyStatus.APPLIED });
      mount(AppHeader);
      expect(router.replace).not.toHaveBeenCalledOnce();
    });

    it("should update router when categories are loaded", async () => {
      await render();
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({
          category: categories[0]!.name,
          status: VacancyStatus.NEW,
        }),
      });
    });

    it("should set query status when categories loaded", async () => {
      await router.setQuery({ status: VacancyStatus.APPLIED });
      await render();
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({ status: VacancyStatus.APPLIED }),
      });
    });

    it("should set default query status when categories loaded", async () => {
      mount(AppHeader);
      await router.setQuery({ status: undefined });
      await flushPromises();
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({ status: VacancyStatus.NEW }),
      });
    });
  });

  describe("parse", () => {
    it("should call request with params", async () => {
      const resp = new AxiosResponseFactory({ data: { created: 1, removed: 0 } }).create();
      const mockRunParse = vi.spyOn(crawlerClient, "runParse").mockResolvedValueOnce(resp);
      const wrapper = await render();
      await getByAriaLabel(wrapper, "Fetch new").trigger("click");
      expect(mockRunParse).toHaveBeenCalledExactlyOnceWith({ data: { category: categories[0]!.name } });
    });

    it("should call request without params", async () => {
      const resp = new AxiosResponseFactory({ data: { created: 1, removed: 0 } }).create();
      const mockRunParse = vi.spyOn(crawlerClient, "runParse").mockResolvedValueOnce(resp);
      const wrapper = await render();
      await router.setQuery({ category: undefined });
      await getByAriaLabel(wrapper, "Fetch new").trigger("click");
      expect(mockRunParse).toHaveBeenCalledExactlyOnceWith();
    });

    it("should call bus event", async () => {
      const resp = new AxiosResponseFactory({ data: { created: 2, removed: 5 } }).create();

      vi.spyOn(crawlerClient, "runParse").mockResolvedValueOnce(resp);
      const spy = vi.spyOn(bus, "emit");

      const wrapper = await render();
      await getByAriaLabel(wrapper, "Fetch new").trigger("click");
      await flushPromises();
      expect(spy).toHaveBeenCalledExactlyOnceWith(EventNames.REFETCH_VACANCIES, "Created: 2, Removed: 5");
    });
  });
});
