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
import AppHeader from "src/layout/AppHeader.vue";

vi.spyOn(crawlerClient, "runParse");

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
      http.get(categoryClient.path.categoryList(), () => {
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

  describe("status buttons", () => {
    it("should change status query param on button clicks", async () => {
      const wrapper = await render();
      const statusButton = wrapper.findAll("button").find((btn) => btn.text() === "New");
      await statusButton?.trigger("click");
      expect(router.replace).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({ status: VacancyStatus.NEW }),
        }),
      );
    });
  });

  it("should emit event when settings button is clicked", async () => {
    const wrapper = await render();
    const spy = vi.spyOn(bus, "emit");
    const settingsButton = wrapper.findAll("button").find((btn) => btn.text() === "settings");
    await settingsButton?.trigger("click");
    expect(spy).toHaveBeenCalledWith(EventNames.OPEN_SETTINGS);
  });

  describe("query params", () => {
    it.each(["wrong", undefined])("should set query status on mounted when status is %s", async (status) => {
      await router.setQuery({ status });
      mount(AppHeader);
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({ status: VacancyStatus.NEW }),
      });
    });

    it("should not set query status on mounted if query has status already", async () => {
      await router.setQuery({ status: VacancyStatus.APPLIED });
      mount(AppHeader);
      expect(router.replace).not.toHaveBeenCalledOnce();
    });

    it("should update router when categories are loaded", async () => {
      await render();
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({
          category: categories[0].name,
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

    it("should change query status on button click", async () => {
      const wrapper = await render();

      // @ts-expect-error var statuses is private
      const label = wrapper.vm.statuses.find(({ status }) => status === VacancyStatus.APPLIED).label;
      const statusButton = wrapper.find(`button[aria-label='${label}']`);
      await statusButton?.trigger("click");
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({ status: VacancyStatus.APPLIED }),
      });
    });

    it("should change query category on button click", async () => {
      const wrapper = await render();

      const label = categories[0].name;
      const statusButton = wrapper.find(`button[aria-label='${label}']`);
      await statusButton?.trigger("click");
      expect(router.replace).toHaveBeenCalledWith({
        query: expect.objectContaining({ category: label }),
      });
    });
  });

  describe("parse", () => {
    it("should call request with params", async () => {
      const resp = new AxiosResponseFactory({ data: { created: 1, removed: 0 } }).create();
      const mockRunParse = vi.spyOn(crawlerClient, "runParse").mockResolvedValueOnce(resp);
      const wrapper = await render();
      const fetchButton = wrapper.findAll("button").find((btn) => btn.text() === "Fetch new");
      await fetchButton?.trigger("click");
      expect(mockRunParse).toHaveBeenCalledExactlyOnceWith({ data: { category: categories[0].name } });
    });

    it("should call request without params", async () => {
      const resp = new AxiosResponseFactory({ data: { created: 1, removed: 0 } }).create();
      const mockRunParse = vi.spyOn(crawlerClient, "runParse").mockResolvedValueOnce(resp);
      const wrapper = await render();
      await router.setQuery({ category: undefined });
      const fetchButton = wrapper.findAll("button").find((btn) => btn.text() === "Fetch new");
      await fetchButton?.trigger("click");
      expect(mockRunParse).toHaveBeenCalledExactlyOnceWith();
    });
  });
});
