import { http, type JsonBodyType } from "msw";
import { flushPromises } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { aMounter, sMounter } from "test/utils/options";
import { VacancyDetailOutFactory } from "test/utils/factories/vacancy";
import { HttpResponse, server } from "test/utils/server";
import { AxiosResponseFactory } from "test/utils/factories/generic";
import { VacancyStatus } from "src/constants";
import { vacancyQuery } from "src/api/query/vacancy";
import { bus, EventNames } from "src/bus";
import VacancyList from "src/views/vacancy/VacancyList.vue";

const { successMessage, errorMessage } = vi.hoisted(() => {
  return {
    successMessage: vi.fn(),
    errorMessage: vi.fn(),
  };
});

vi.mock("src/hooks/useMessage", () => ({
  useMessage: () => ({ successMessage, errorMessage }),
}));

const responseMock = (response: JsonBodyType) => {
  server.use(
    http.get(vacancyQuery.client.path.list(), () => {
      return HttpResponse.json(response);
    }),
  );
};

describe("VacancyList", () => {
  const vacancies = new VacancyDetailOutFactory((sequence) => {
    const preset = [
      { id: sequence, v_id: sequence, status: VacancyStatus.NEW, read: false },
      { id: sequence, v_id: sequence, status: VacancyStatus.NEW, read: true },
      { id: sequence, v_id: sequence, status: VacancyStatus.BANNED },
    ];
    return {
      ...preset[sequence - 1],
    };
  }).paginated(3);
  const axiosResponse = new AxiosResponseFactory({ data: vacancies }).create();

  const options = { props: { status: VacancyStatus.NEW, category: "Python" } };
  const render = aMounter(VacancyList, options, async (wrapper) => {
    if (wrapper) {
      await flushPromises();
      await wrapper.vm.$nextTick();
    }
  });
  const syncRender = sMounter(VacancyList, options);

  beforeEach(() => {
    bus.all.clear();
  });

  beforeAll(() => {
    responseMock(vacancies);
  });

  it("should render the component", async () => {
    const wrapper = await render();
    expect(wrapper.exists()).toBe(true);
  });

  it("should show loading text", async () => {
    const wrapper = syncRender();
    expect(wrapper.find("i.pi-spin").exists()).toBe(true);
  });

  it("api client should be called on mounted", async () => {
    const spy = vi.spyOn(vacancyQuery.client, "vacanciesList");
    await render();
    expect(spy).toHaveBeenCalledExactlyOnceWith({
      data: { ...options.props, search: undefined, limit: 10, offset: 0 },
    });
  });

  it("api client should be called with optional search", async () => {
    const spy = vi.spyOn(vacancyQuery.client, "vacanciesList");
    await render({ props: { search: "foo" } });
    expect(spy).toHaveBeenCalledExactlyOnceWith({
      data: { ...options.props, search: "foo", limit: 10, offset: 0 },
    });
  });

  const loadMoreSelector = "[aria-label='Load more']";

  describe("empty pagination", () => {
    it("button load more should be hide", async () => {
      responseMock(new VacancyDetailOutFactory().paginated(1));
      const wrapper = await render();
      expect(wrapper.find(loadMoreSelector).exists()).toBe(false);
    });
  });

  describe("pagination", () => {
    beforeAll(() => {
      responseMock(new VacancyDetailOutFactory().paginated(12));
    });

    it("button load more should be hide on fetching", async () => {
      const wrapper = syncRender();
      expect(wrapper.find(loadMoreSelector).exists()).toBe(false);
    });

    it("button load more should be visible", async () => {
      const wrapper = await render();
      expect(wrapper.find(loadMoreSelector).exists()).toBe(true);
    });

    it("button load more should make request with offset", async () => {
      const wrapper = await render();
      const spy = vi.spyOn(vacancyQuery.client, "vacanciesList");
      await wrapper.find(loadMoreSelector).trigger("click");
      expect(spy).toHaveBeenCalledExactlyOnceWith({ data: expect.objectContaining({ offset: 10 }) });
    });
  });

  describe("bus event", () => {
    it("should show success message", async () => {
      await render();
      bus.emit(EventNames.REFETCH_VACANCIES);
      await flushPromises();
      expect(successMessage).toHaveBeenLastCalledWith("Refresh success", "Vacancies refreshed successfully");
    });

    it("api client should be called on the event", async () => {
      const spy = vi.spyOn(vacancyQuery.client, "vacanciesList").mockResolvedValue(axiosResponse);
      await render();
      bus.emit(EventNames.REFETCH_VACANCIES);
      await flushPromises();
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe("card", () => {
    beforeAll(() => {
      server.use(
        http.patch(vacancyQuery.client.path.detail({ v_id: 1 }), async ({ request }) => {
          const data = await request.json();
          return HttpResponse.json(data);
        }),
        http.patch(vacancyQuery.client.path.detail({ v_id: 2 }), async ({ request }) => {
          const data = await request.json();
          return HttpResponse.json(data);
        }),
      );
    });

    it("the list has correct items length", async () => {
      const wrapper = await render();
      expect(wrapper.findAllComponents({ name: "VacancyCard" }).length).toBe(3);
    });

    it("the list has correct items classes", async () => {
      const wrapper = await render();
      const [card1, card2, card3] = wrapper.findAllComponents({ name: "VacancyCard" });
      expect(card1).toBeDefined();
      expect(card1!.classes()).toContain("bg-sky-300");
      expect(card2!.classes()).toContain("bg-sky-50");
      expect(card3!.classes()).toContain("bg-red-200");
    });

    it("the list has correct items classes when selected", async () => {
      const wrapper = await render();
      const [card1] = wrapper.findAllComponents({ name: "VacancyCard" });

      expect(card1).toBeDefined();
      expect(card1!.classes()).not.toContain("border-pink-400");
      expect(card1!.classes()).not.toContain("bg-pink-200");

      await card1!.trigger("click");
      await flushPromises();
      await wrapper.vm.$nextTick();
      expect(card1!.classes()).toContain("border-pink-600");
      expect(card1!.classes()).toContain("bg-pink-200");
      expect(
        card1!.classes().filter((token) => token.startsWith("bg")).length,
        "should be only 1 background class",
      ).toBe(1);
    });

    it("calls request on a card click", async () => {
      const spy = vi.spyOn(vacancyQuery.client, "patchVacancy");
      const wrapper = await render();
      const [card1] = wrapper.findAllComponents({ name: "VacancyCard" });
      await card1?.trigger("click");
      await flushPromises();
      expect(spy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ data: { read: true } }));
    });

    it("should not calls request on a card click when vacancy read already", async () => {
      const spy = vi.spyOn(vacancyQuery.client, "patchVacancy");
      const wrapper = await render();
      const [, card2] = wrapper.findAllComponents({ name: "VacancyCard" });
      await card2?.trigger("click");
      await flushPromises();
      expect(spy).not.toHaveBeenCalled();
    });

    it("calls request on change status", async () => {
      const spy = vi.spyOn(vacancyQuery.client, "patchVacancy");
      const wrapper = await render();
      const [card1] = wrapper.findAllComponents({ name: "VacancyCard" });
      card1?.vm.$emit("change-status", { v_id: 2, status: VacancyStatus.APPLIED });
      await flushPromises();
      expect(spy).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ data: { status: VacancyStatus.APPLIED } }));
    });
  });
});
