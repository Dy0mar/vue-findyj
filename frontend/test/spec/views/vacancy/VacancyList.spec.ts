import { http, type JsonBodyType } from "msw";
import { flushPromises } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";
import type { Paginated } from "src/types/models/extra";
import { aMounter, sMounter } from "test/utils/options";
import { VacancyDetailOutFactory } from "test/utils/factories/vacancy";
import { HttpResponse, server } from "test/utils/server";
import { AxiosResponseFactory } from "test/utils/factories/generic";
import { getByRole } from "test/utils/selector";
import { VacancyStatus } from "src/constants";
import { vacancyQuery } from "src/api/query/vacancy";
import { queryClient } from "src/queryClient";
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
    expect(getByRole(wrapper, "progressbar").exists()).toBe(true);
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

  describe("empty message", () => {
    it("should show empty message", async () => {
      responseMock(new VacancyDetailOutFactory().paginated(0));
      const wrapper = await render();
      expect(wrapper.text()).toContain("No items");
    });

    it("should not show empty message", async () => {
      responseMock(new VacancyDetailOutFactory().paginated(1));
      const wrapper = await render();
      expect(wrapper.text()).not.toContain("No items");
    });
  });

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
    it.each([undefined, "Created: 5, Removed: 5"])("should show success message", async (message) => {
      await render();
      bus.emit(EventNames.REFETCH_VACANCIES, message);
      await flushPromises();
      expect(successMessage).toHaveBeenLastCalledWith("Refresh success", message ?? "Vacancies refreshed successfully");
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

    it("should not calls request on a card click when full_description is set", async () => {
      const spy = vi.spyOn(vacancyQuery.client, "patchVacancy");
      const wrapper = await render();
      const [card1] = wrapper.findAllComponents({ name: "VacancyCard" });
      await card1?.trigger("click");
      await flushPromises();
      expect(spy).not.toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ data: { read: true } }));
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

    describe("onCardSelect with missing full_description", () => {
      const vacancyLink = "https://jobs.example.com/companies/testcorp/vacancies/99/";
      const exportUrl = "https://jobs.example.com/companies/testcorp/vacancies/export/";

      const page: Paginated<VacancyDetailOut> = {
        count: 1,
        items: [
          {
            id: 1,
            v_id: 99,
            badges: [],
            title: "Test",
            description: "test",
            full_description: null,
            link: vacancyLink,
            date: "today",
            company: "testcorp",
            salary: null,
            status: VacancyStatus.NEW,
            comment: "",
            cities: "",
            status_display: "new",
            read: false,
            category: "Python",
          },
        ],
      };

      beforeEach(() => {
        const s = ref<VacancyDetailOut["status"]>(VacancyStatus.NEW as VacancyDetailOut["status"]);
        const c = ref<VacancyDetailOut["category"]>("Python" as VacancyDetailOut["category"]);
        const q = ref<string | undefined>(undefined);
        queryClient.setQueryData(vacancyQuery.vacanciesList(s, c, q).queryKey, { pages: [page], pageParams: [0] });
      });

      it("should call fetch and emit selected when fetch fails", async () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false } as Response);
        const wrapper = await render();
        expect(wrapper.findComponent({ name: "VacancyCard" }).exists()).toBe(true);
        await wrapper.findComponent({ name: "VacancyCard" }).trigger("click");
        await flushPromises();
        expect(fetchSpy).toHaveBeenCalledWith(exportUrl, expect.any(Object));
        expect(wrapper.emitted("selected")).toBeDefined();
      });

      it("should call fetch and patch when fetch succeeds", async () => {
        const desc = "<p>Full job description</p>";
        server.use(
          http.patch(vacancyQuery.client.path.detail({ v_id: 99 }), async ({ request }) => {
            const data = await request.json();
            return HttpResponse.json(data);
          }),
        );
        const patchSpy = vi.spyOn(vacancyQuery.client, "patchVacancy");
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
          ok: true,
          json: async () => [{ link: vacancyLink, description: desc }],
        } as Response);
        const wrapper = await render();
        expect(wrapper.findComponent({ name: "VacancyCard" }).exists()).toBe(true);
        await wrapper.findComponent({ name: "VacancyCard" }).trigger("click");
        await flushPromises();
        expect(patchSpy).toHaveBeenCalledWith(
          expect.objectContaining({ data: expect.objectContaining({ full_description: desc }) }),
        );
      });

      it("should emit selected without fetch when link has no company", async () => {
        const badPage = { ...page, items: [{ ...page.items[0]!, link: "https://example.com/no-company-here" }] };
        const s = ref<VacancyDetailOut["status"]>(VacancyStatus.NEW as VacancyDetailOut["status"]);
        const c = ref<VacancyDetailOut["category"]>("Python" as VacancyDetailOut["category"]);
        const q = ref<string | undefined>(undefined);
        queryClient.setQueryData(vacancyQuery.vacanciesList(s, c, q).queryKey, { pages: [badPage], pageParams: [0] });
        const wrapper = await render();
        await wrapper.findComponent({ name: "VacancyCard" }).trigger("click");
        await flushPromises();
        expect(wrapper.emitted("selected")).toBeDefined();
      });

      it("should emit selected when export has no matching vacancy", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue({
          ok: true,
          json: async () => [{ link: "https://other.link", description: "desc" }],
        } as Response);
        const wrapper = await render();
        await wrapper.findComponent({ name: "VacancyCard" }).trigger("click");
        await flushPromises();
        expect(wrapper.emitted("selected")).toBeDefined();
      });
    });
  });
});
