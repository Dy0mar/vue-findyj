import { http } from "msw";
import { beforeAll, describe, expect, it } from "vitest";

import { HttpResponse, server } from "test/utils/server";
import { vacancyClient } from "src/api/client/vacancy";
import { VacancyDetailOutFactory } from "test/utils/factories/vacancy";
import { VacancyStatus } from "src/constants";

describe("vacancyClient", () => {
  const queryParams = {
    data: { status: VacancyStatus.NEW, category: "Python", offset: 0, limit: 10 },
  };
  const v_id = 1;
  const vacancies = new VacancyDetailOutFactory().paginated(1);

  beforeAll(() => {
    server.use(
      http.get(vacancyClient.path.list(), () => {
        return HttpResponse.json(vacancies);
      }),
      http.patch(vacancyClient.path.detail({ v_id }), async ({ request }) => {
        const data = await request.json();
        return HttpResponse.json(data);
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
});
