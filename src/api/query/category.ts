import type { Category } from "src/types/models/crawler/category";
import type { UseQueryOptions } from "src/api/query/types";
import { categoryClient } from "src/api/client/category";

const CATEGORY_LIST_QUERY_KEY = "api.categories";
type CategoryListQueryKey = readonly [typeof CATEGORY_LIST_QUERY_KEY];

class CategoryQuery {
  client = categoryClient;

  /**
   * List of all categories
   */
  categoryList() {
    return {
      queryKey: [CATEGORY_LIST_QUERY_KEY],
      queryFn: async () => (await this.client.categoryList()).data,
    } satisfies UseQueryOptions<Category[], CategoryListQueryKey>;
  }
}

export const categoryQuery = new CategoryQuery();
