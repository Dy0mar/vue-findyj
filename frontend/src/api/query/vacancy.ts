import type { AxiosResponse } from "axios";
import type { Ref } from "vue";
import type { Paginated } from "src/types/models/extra";
import type { VacancyDetailOut, VacancyIn } from "src/types/models/vacancy/vacancy";
import type { Pages, UseInfiniteQueryOptions, UseMutationOptions } from "src/api/query/types";
import { vacancyClient } from "src/api/client/vacancy";
import { queryClient } from "src/queryClient";
import { DEFAULT_PAGE_SIZE } from "src/constants";

const ROOT_QUERY_KEY = "api.vacancies";

type VacancyListQueryKey = readonly [
  typeof ROOT_QUERY_KEY,
  VacancyDetailOut["status"],
  VacancyDetailOut["category"],
  string | undefined,
];

class VacancyQuery {
  client = vacancyClient;
  PER_PAGE = DEFAULT_PAGE_SIZE;

  /**
   * List of all vacancies
   */
  vacanciesList(
    status: Ref<VacancyDetailOut["status"]>,
    category: Ref<VacancyDetailOut["category"]>,
    search: Ref<string | undefined>,
  ) {
    return {
      queryKey: [ROOT_QUERY_KEY, status, category, search],
      initialPageParam: 0,
      queryFn: async ({ queryKey, pageParam }) => {
        const [, status, category, search] = queryKey;
        return (
          await this.client.vacanciesList({
            data: { status, category, search, offset: pageParam, limit: this.PER_PAGE },
          })
        ).data;
      },
      getNextPageParam: (_, allPages) => {
        return allPages.filter((p) => p.items.length > 0).length * this.PER_PAGE;
      },
    } satisfies UseInfiniteQueryOptions<Paginated<VacancyDetailOut>, VacancyListQueryKey>;
  }

  patchVacancy() {
    return {
      mutationFn: async ({ v_id, ...rest }) => {
        return await this.client.patchVacancy({ params: { v_id }, data: rest });
      },
      onMutate: async ({ v_id, status, read }) => {
        await queryClient.cancelQueries({ queryKey: [ROOT_QUERY_KEY], exact: false });

        // mark read all cached vacancy in caches
        if (read !== undefined) {
          queryClient.setQueriesData<Pages<VacancyDetailOut>>(
            { queryKey: [ROOT_QUERY_KEY], exact: false },
            (oldData) => {
              if (!oldData?.pages) {
                return oldData;
              }

              return {
                ...oldData,
                pages: oldData.pages.map((page) => ({
                  ...page,
                  items: page.items.map((item) => (item.v_id === v_id ? { ...item, read } : item)),
                })),
              };
            },
          );
          // remove vacancy from all caches
        } else if (status !== undefined) {
          queryClient
            .getQueriesData<Pages<VacancyDetailOut>>({ queryKey: [ROOT_QUERY_KEY], exact: false })
            .filter((scope) => (scope[0] as VacancyListQueryKey)[1] !== status)
            .forEach((scope) => {
              const queryKey = scope[0] as VacancyListQueryKey;
              queryClient.setQueryData<Pages<VacancyDetailOut>>(queryKey, (currentData) => {
                if (!currentData?.pages || currentData.pages.length === 0) {
                  return currentData;
                }

                // Correctly get the total count from the first page.
                const oldTotalCount = currentData.pages[0]!.count;
                const newTotalCount = Math.max(0, oldTotalCount - 1);

                // Flatten all items from all pages into a single array.
                const allItems = currentData.pages.flatMap((p) => p.items);
                const itemIndex = allItems.findIndex((item) => item.v_id === v_id);

                // If the item to be removed is not found, return the original data.
                if (itemIndex === -1) {
                  return currentData;
                }

                // Create a new array of items without the removed item.
                const newItems = allItems.filter((item) => item.v_id !== v_id);

                // If there are no items left in the cache, return an empty state.
                if (newItems.length === 0) {
                  return { pages: [], pageParams: [] };
                }

                // Re-create the pages from the new list of items.
                const newPages = [];
                for (let i = 0; i < newItems.length; i += this.PER_PAGE) {
                  newPages.push({
                    items: newItems.slice(i, i + this.PER_PAGE),
                    count: newTotalCount, // Use the correct total count.
                  });
                }

                // Generate new page parameters (offsets).
                const newPageParams = newPages.map((_, index) => index * this.PER_PAGE);

                return {
                  pages: newPages,
                  pageParams: newPageParams,
                };
              });
            });
        }
      },
    } satisfies UseMutationOptions<
      { v_id: number; status?: VacancyIn["status"]; read?: VacancyIn["read"] },
      AxiosResponse
    >;
  }
}

export const vacancyQuery = new VacancyQuery();
