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
  basePath = "/vacancy";

  vacanciesList() {
    return this.url({ action: "" });
  }

  vacancyDetail(params: URLParams) {
    return this.url({ action: ":v_id/", params });
  }

  // titleStopWord() {
  //   return this.url({ action: "title-stop-word" });
  // }

  // titleStopWordDetail(params: IDParams) {
  //   return this.url({ action: "title-stop-word/:id", params });
  // }

  // applyTitleStopWord() {
  //   return this.url({ action: "apply-title-stop-word" });
  // }
  //
  // descriptionStopWord() {
  //   return this.url({ action: "description-stop-word" });
  // }
  //
  // descriptionStopWordDetail(params: IDParams) {
  //   return this.url({ action: "description-stop-word/:id", params });
  // }
  //
  // applyDescriptionStopWord() {
  //   return this.url({ action: "apply-description-stop-word" });
  // }
}

class VacancyClient extends BaseAPIClient {
  path = new Path();

  vacanciesList(ctx: { data: VacancyListQuery & { search?: string; limit: number } }) {
    const url = this.path.vacanciesList();
    return this.client.get<Paginated<VacancyDetailOut>>(url, { params: ctx.data });
  }

  patchVacancy(ctx: { params: URLParams; data: VacancyIn }) {
    const url = this.path.vacancyDetail(ctx.params);
    return this.client.patch(url, ctx.data);
  }

  // /** Title stop words */
  // titleStopWordList() {
  //   const url = this.path.titleStopWord();
  //   return this.client.get<TitleStopWord[]>(url);
  // }

  // addTitleStopWord(ctx: { data: TitleStopWordIn }) {
  //   const url = this.path.titleStopWord();
  //   return this.client.post(url, ctx.data);
  // }

  // removeTitleStopWord(ctx: { params: { id: TitleStopWord["id"] } }) {
  //   const url = this.path.titleStopWordDetail(ctx.params);
  //   return this.client.delete(url);
  // }

  // applyTitleStopWord() {
  //   const url = this.path.applyTitleStopWord();
  //   return this.client.get(url);
  // }

  /** Description stop words */

  // descriptionStopWordList() {
  //   const url = this.path.descriptionStopWord();
  //   return this.client.get<DescriptionStopWord[]>(url);
  // }
  //
  // addDescriptionStopWord(ctx: { data: DescriptionStopWordIn }) {
  //   const url = this.path.descriptionStopWord();
  //   return this.client.post(url, ctx.data);
  // }
  //
  // removeDescriptionStopWord(ctx: { params: { id: DescriptionStopWord["id"] } }) {
  //   const url = this.path.descriptionStopWordDetail(ctx.params);
  //   return this.client.delete(url);
  // }

  // applyDescriptionStopWord(ctx?: { data: { category: string } }) {
  //   const url = this.path.applyDescriptionStopWord();
  //   return this.client.get(url, { params: ctx?.data });
  // }
}

export const vacancyClient = new VacancyClient();
