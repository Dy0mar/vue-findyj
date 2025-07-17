import type { Category } from "src/types/models/crawler/category";
import { BaseAPIClient, BasePath } from "src/api/client/base";

class Path extends BasePath {
  basePath = "/categories";

  categoryList() {
    return this.url({ action: "" });
  }
}

class CategoryClient extends BaseAPIClient {
  path = new Path();

  categoryList() {
    const url = this.path.categoryList();
    return this.client.get<Category[]>(url);
  }
}

export const categoryClient = new CategoryClient();
