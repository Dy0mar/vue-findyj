import { http } from "msw";
import { ref, unref } from "vue";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Pages } from "src/api/query/types";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";
import { queryClient } from "src/queryClient";
import { vacancyQuery } from "src/api/query/vacancy";
import { VacancyStatus } from "src/constants";
import { HttpResponse, server } from "test/utils/server";
import { callQueryFn } from "test/utils/misc";
import { VacancyDetailOutFactory } from "test/utils/factories/vacancy";

describe("vacancyQuery", () => {
  const query = vacancyQuery;
  const vacancies = new VacancyDetailOutFactory().paginated(2);
  const vacancyId = vacancies.items[0]!.v_id;

  const status = ref<VacancyDetailOut["status"]>(VacancyStatus.NEW);
  const category = ref<VacancyDetailOut["category"]>("Python");
  const search = ref<string>();

  const restoreQueryParams = () => {
    status.value = VacancyStatus.NEW;
    category.value = "Python";
    search.value = undefined;
  };

  beforeAll(() => {
    server.use(
      http.get(query.client.path.list(), () => {
        return HttpResponse.json(vacancies);
      }),
    );
  });

  describe("vacancies", () => {
    beforeEach(restoreQueryParams);

    it("should have an initialPageParam", () => {
      expect(query.vacanciesList(status, category, search).initialPageParam).toBe(0);
    });

    it("should return vacancies", async () => {
      const data = await callQueryFn(query.vacanciesList(status, category, search));
      expect(data).toStrictEqual(vacancies);
    });

    it("should use reactive query key", async () => {
      const listQuery = query.vacanciesList(status, category, search);

      expect(listQuery.queryKey.map(unref)).toEqual(expect.arrayContaining([VacancyStatus.NEW, "Python", undefined]));

      status.value = VacancyStatus.BANNED;
      category.value = "Front-end";
      search.value = "foo";

      expect(listQuery.queryKey.map(unref)).toEqual(expect.arrayContaining([VacancyStatus.BANNED, "Front-end", "foo"]));
    });

    it("calculates next offset based on fetched page", () => {
      expect(query.vacanciesList(status, category, search).getNextPageParam(vacancies, [vacancies])).toBe(
        query.PER_PAGE,
      );
    });

    it("calculates next offset based on fetched pages", () => {
      expect(query.vacanciesList(status, category, search).getNextPageParam(vacancies, [vacancies, vacancies])).toBe(
        query.PER_PAGE * 2,
      );
    });

    it("ignores empty pages when calculates the offset", () => {
      expect(
        query
          .vacanciesList(status, category, search)
          .getNextPageParam(vacancies, [vacancies, { ...vacancies, items: [] }]),
      ).toBe(query.PER_PAGE);
    });
  });

  describe("patchVacancy", () => {
    beforeEach(restoreQueryParams);

    beforeAll(() => {
      server.use(
        http.patch(query.client.path.detail({ v_id: vacancyId }), async ({ request }) => {
          const data = await request.json();
          return HttpResponse.json(data);
        }),
      );
    });

    it("correct response patch vacancy data", async () => {
      const data = { v_id: vacancyId, status: VacancyStatus.BANNED };
      const result = await query.patchVacancy().mutationFn(data);
      expect(result.data).toStrictEqual({ status: VacancyStatus.BANNED });
    });

    it("should mark entry as read by id", async () => {
      const vacancies = new VacancyDetailOutFactory({ read: false }).paginated(2);
      const pages = {
        pages: [vacancies],
        pageParams: [0],
      } satisfies Pages<VacancyDetailOut>;
      queryClient.setQueryData(query.vacanciesList(status, category, search).queryKey, pages);

      await query.patchVacancy().onMutate({ v_id: vacancies.items[0]!.v_id, read: true });
      const data = queryClient.getQueryData<Pages<VacancyDetailOut>>(
        query.vacanciesList(status, category, search).queryKey,
      );
      expect(data?.pages[0]?.items[0]).toStrictEqual(expect.objectContaining({ read: true }));
    });

    it.each([
      { action: "read", data: { read: true } },
      { action: "status", data: { status: VacancyStatus.BANNED } },
    ])("should return early if oldData is undefined when change $action", async ({ data }) => {
      queryClient.setQueryData(query.vacanciesList(status, category, search).queryKey, undefined);
      const result = await query.patchVacancy().onMutate({ v_id: 1, ...data });
      expect(result).toBeUndefined();
    });

    it.each([
      { action: "read", data: { read: true } },
      { action: "status", data: { status: VacancyStatus.BANNED } },
    ])("should return early if oldData.pages is undefined when change $action", async ({ data }) => {
      queryClient.setQueryData(query.vacanciesList(status, category, search).queryKey, {});
      const result = await query.patchVacancy().onMutate({ v_id: 1, ...data });
      expect(result).toBeUndefined();
    });

    it("should remove from cache entries by id", async () => {
      const vacancies = new VacancyDetailOutFactory({ status: VacancyStatus.NEW }).paginated(2);
      const v_id = vacancies.items[0]!.v_id;
      const pages = {
        pages: [vacancies],
        pageParams: [0],
      } satisfies Pages<VacancyDetailOut>;
      queryClient.setQueryData(query.vacanciesList(status, category, search).queryKey, pages);

      await query.patchVacancy().onMutate({ v_id, status: VacancyStatus.BANNED });
      const data = queryClient.getQueryData<Pages<VacancyDetailOut>>(
        query.vacanciesList(status, category, search).queryKey,
      );
      expect(data?.pages[0]?.items).toStrictEqual(expect.not.arrayContaining([expect.objectContaining({ v_id })]));
    });

    it("should not remove from cache entries by id if not found", async () => {
      const vacancies = new VacancyDetailOutFactory({ status: VacancyStatus.NEW }).paginated(2);
      const pages = {
        pages: [vacancies],
        pageParams: [0],
      } satisfies Pages<VacancyDetailOut>;
      queryClient.setQueryData(query.vacanciesList(status, category, search).queryKey, pages);

      await query.patchVacancy().onMutate({ v_id: 0, status: VacancyStatus.BANNED });
      const data = queryClient.getQueryData<Pages<VacancyDetailOut>>(
        query.vacanciesList(status, category, search).queryKey,
      );
      expect(data?.pages[0]?.items.length).toBe(2);
    });
  });
});
