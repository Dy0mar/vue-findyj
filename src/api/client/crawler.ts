import type { Category, ParsedResult } from "src/types/models/crawler/category";
import { BaseAPIClient, BasePath } from "src/api/client/base";

class Path extends BasePath {
  basePath = "/crawler";

  runParse() {
    return this.url({ action: "run-parse" });
  }
}

class CrawlerClient extends BaseAPIClient {
  path = new Path();

  runParse(ctx?: { data: { category: Category["name"] } }) {
    const url = this.path.runParse();
    return this.client.get<ParsedResult>(url, { params: ctx?.data });
  }
}

export const crawlerClient = new CrawlerClient();
