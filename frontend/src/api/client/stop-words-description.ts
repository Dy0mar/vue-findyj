import { BaseAPIClient, BasePath } from "src/api/client/base";
import type { DescriptionStopWord, DescriptionStopWordIn } from "src/types/models/vacancy/vacancy";

type IDParams = {
  id: number;
};

class Path extends BasePath<IDParams> {
  basePath = "/stop-words/description";

  list() {
    return this.url({ action: "" });
  }

  detail(params: IDParams) {
    return this.url({ action: ":id", params });
  }

  apply() {
    return this.url({ action: "apply" });
  }
}

class StopWordsDescriptionClient extends BaseAPIClient {
  path = new Path();

  list() {
    const url = this.path.list();
    return this.client.get<DescriptionStopWord[]>(url);
  }

  create(ctx: { data: DescriptionStopWordIn }) {
    const url = this.path.list();
    return this.client.post(url, ctx.data);
  }

  delete(ctx: { params: { id: DescriptionStopWord["id"] } }) {
    const url = this.path.detail(ctx.params);
    return this.client.delete(url);
  }

  apply(ctx?: { data: { category: string } }) {
    const url = this.path.apply();
    return this.client.get(url, { params: ctx?.data });
  }
}

export const stopWordsDescriptionClient = new StopWordsDescriptionClient();
