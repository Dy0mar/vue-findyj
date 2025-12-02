import { http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";

import { HttpResponse, server } from "test/utils/server";
import { vacancyClient } from "src/api/client/vacancy";
import { VacancyDetailOutFactory } from "test/utils/factories/vacancy";
import { VacancyStatus } from "src/constants";

describe("categoryClient", () => {
  const queryParams = {
    data: { status: VacancyStatus.NEW, category: "Python", offset: 0, limit: 10 },
  };
  const v_id = 1;
  const vacancies = new VacancyDetailOutFactory().paginated(1);

  beforeAll(() => {
    server.use(
      http.get(vacancyClient.path.vacanciesList(), () => {
        return HttpResponse.json(vacancies);
      }),
      http.patch(vacancyClient.path.vacancyDetail({ v_id }), async ({ request }) => {
        const data = await request.json();
        return HttpResponse.json(data);
      }),
      http.post(vacancyClient.path.titleStopWord(), () => {
        return HttpResponse.json(undefined, { status: 201 });
      }),
      http.get(vacancyClient.path.applyTitleStopWord(), () => {
        return HttpResponse.json(undefined, { status: 200 });
      }),
      http.post(vacancyClient.path.descriptionStopWord(), () => {
        return HttpResponse.json(undefined, { status: 201 });
      }),
      http.get(vacancyClient.path.applyDescriptionStopWord(), () => {
        return HttpResponse.json(undefined, { status: 200 });
      }),
    );
  });

  it("correct response list data", async () => {
    const response = await vacancyClient.vacanciesList(queryParams);
    expect(response.data).toStrictEqual(vacancies);
  });

  it("correct response patch vacancy data", async () => {
    const response = await vacancyClient.patchVacancy({ params: { v_id }, data: { status: VacancyStatus.BANNED } });
    expect(response.data).toStrictEqual({ status: VacancyStatus.BANNED });
  });

  it.each([
    { name: "title", callback: vacancyClient.addTitleStopWord.bind(vacancyClient) },
    { name: "description", callback: vacancyClient.addDescriptionStopWord.bind(vacancyClient) },
  ])("correct add $name stop word", async ({ callback }) => {
    const response = await callback({ data: { word: "stop" } });
    expect(response.status).toBe(201);
  });

  it.each([
    { name: "title", callback: vacancyClient.applyTitleStopWord.bind(vacancyClient) },
    {
      name: "description",
      callback: vacancyClient.applyDescriptionStopWord.bind(vacancyClient),
      data: { category: "Python" },
    },
  ])("correct apply $name stop word", async ({ callback, data }) => {
    const response = await callback(data ? { data } : undefined);
    expect(response.status).toBe(200);
  });
});
