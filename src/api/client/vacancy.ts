import { BaseAPIClient, BasePath } from "src/api/client/base";
import type {
  DescriptionStopWordIn,
  TitleStopWordIn,
  VacancyDetailOut,
  VacancyIn,
} from "src/types/models/vacancy/vacancy";
import type { Paginated } from "src/types/models/extra";
import type { VacancyListQuery } from "src/types/models/query";

type URLParams = {
  v_id: number;
};

class Path extends BasePath<URLParams> {
  basePath = "/vacancy";

  vacanciesList() {
    return this.url({ action: "" });
  }

  vacancyDetail(params: URLParams) {
    return this.url({ action: ":v_id/", params });
  }

  titleStopWord() {
    return this.url({ action: "title-stop-word" });
  }

  applyTitleStopWord() {
    return this.url({ action: "apply-title-stop-word" });
  }

  descriptionStopWord() {
    return this.url({ action: "description-stop-word" });
  }

  applyDescriptionStopWord() {
    return this.url({ action: "apply-description-stop-word" });
  }
}

class VacancyClient extends BaseAPIClient {
  path = new Path();

  vacanciesList(ctx: { data: VacancyListQuery & { search: string | undefined; limit: number } }) {
    const url = this.path.vacanciesList();
    return this.client.get<Paginated<VacancyDetailOut>>(url, { params: ctx.data });
  }

  patchVacancy(ctx: { params: URLParams; data: VacancyIn }) {
    const url = this.path.vacancyDetail(ctx.params);
    return this.client.patch(url, ctx.data);
  }

  addTitleStopWord(ctx: { data: TitleStopWordIn }) {
    const url = this.path.titleStopWord();
    return this.client.post(url, ctx.data);
  }

  applyTitleStopWord() {
    const url = this.path.applyTitleStopWord();
    return this.client.get(url);
  }

  addDescriptionStopWord(ctx: { data: DescriptionStopWordIn }) {
    const url = this.path.descriptionStopWord();
    return this.client.post(url, ctx.data);
  }

  applyDescriptionStopWord(ctx?: { data: { category: string } }) {
    const url = this.path.applyDescriptionStopWord();
    return this.client.get(url, { params: ctx?.data });
  }
}

export const vacancyClient = new VacancyClient();
