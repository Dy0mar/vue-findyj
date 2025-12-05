import { BaseAPIClient, BasePath } from "src/api/client/base";
import type { TitleStopWord, TitleStopWordIn } from "src/types/models/vacancy/vacancy";

type IDParams = {
  id: number;
};

class Path extends BasePath<IDParams> {
  basePath = "/stop-words/title";

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

class StopWordsTitleClient extends BaseAPIClient {
  path = new Path();

  list() {
    const url = this.path.list();
    return this.client.get<TitleStopWord[]>(url);
  }

  create(ctx: { data: TitleStopWordIn }) {
    const url = this.path.list();
    return this.client.post(url, ctx.data);
  }

  delete(ctx: { params: { id: TitleStopWord["id"] } }) {
    const url = this.path.detail(ctx.params);
    return this.client.delete(url);
  }

  apply() {
    const url = this.path.apply();
    return this.client.get(url);
  }
}

export const stopWordsTitleClient = new StopWordsTitleClient();
