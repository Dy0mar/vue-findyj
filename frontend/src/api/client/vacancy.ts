import { BaseAPIClient, BasePath } from "src/api/client/base";
import type { VacancyDetailOut, VacancyIn } from "src/types/models/vacancy/vacancy";
import type { Paginated } from "src/types/models/extra";
import type { VacancyListQuery } from "src/types/models/query";

type URLParams = {
  v_id: number;
};

type IDParams = {
  id: number;
};

class Path extends BasePath<URLParams | IDParams> {
  basePath = "/vacancies";

  list() {
    return this.url({ action: "" });
  }

  detail(params: URLParams) {
    return this.url({ action: ":v_id/", params });
  }
}

class VacancyClient extends BaseAPIClient {
  path = new Path();

  vacanciesList(ctx: { data: VacancyListQuery & { search?: string; limit: number } }) {
    const url = this.path.list();
    return this.client.get<Paginated<VacancyDetailOut>>(url, { params: ctx.data });
  }

  patchVacancy(ctx: { params: URLParams; data: VacancyIn }) {
    const url = this.path.detail(ctx.params);
    return this.client.patch(url, ctx.data);
  }
}

export const vacancyClient = new VacancyClient();
