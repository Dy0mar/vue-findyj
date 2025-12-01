import type { AxiosResponse } from "axios";
import type { Ref } from "vue";
import type { Paginated } from "src/types/models/extra";
import type {
  VacancyDetailOut,
  TitleStopWordIn,
  DescriptionStopWordIn,
  VacancyIn,
} from "src/types/models/vacancy/vacancy";
import type { Pages, UseInfiniteQueryOptions, UseMutationOptions } from "src/api/query/types";
import { vacancyClient } from "src/api/client/vacancy";
import { queryClient } from "src/queryClient";
import { DEFAULT_PAGE_SIZE } from "src/constants";

const LIST_QUERY_KEY = "api.vacancies";
type VacancyListQueryKey = readonly [
  typeof LIST_QUERY_KEY,
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
      queryKey: [LIST_QUERY_KEY, status, category, search],
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
        await queryClient.cancelQueries({ queryKey: [LIST_QUERY_KEY], exact: false });

        // mark read all cached vacancy in caches
        if (read !== undefined) {
          queryClient.setQueriesData<Pages<VacancyDetailOut>>(
            { queryKey: [LIST_QUERY_KEY], exact: false },
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
            .getQueriesData<Pages<VacancyDetailOut>>({ queryKey: [LIST_QUERY_KEY], exact: false })
            .filter((scope) => (scope[0] as VacancyListQueryKey)[1] !== status)
            .forEach((scope) => {
              const queryKey = scope[0] as VacancyListQueryKey;
              queryClient.setQueryData<Pages<VacancyDetailOut>>(queryKey, (currentData) => {
                if (!currentData?.pages) {
                  return currentData;
                }

                const pages = currentData.pages.map((page) => {
                  const found = page.items.find((item) => item.v_id === v_id);
                  if (found) {
                    return {
                      items: page.items.filter((item) => item.v_id !== v_id),
                      count: page.count - 1,
                    };
                  }
                  return page;
                });

                return {
                  ...currentData,
                  pages,
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

  /**
   * Add title stop word.
   */
  addTitleStopWord() {
    return {
      mutationFn: async (data) => {
        return (await this.client.addTitleStopWord({ data })).data;
      },
    } satisfies UseMutationOptions<TitleStopWordIn>;
  }

  /**
   * Add description stop word.
   */
  addDescriptionStopWord() {
    return {
      mutationFn: async (data) => {
        return (await this.client.addDescriptionStopWord({ data })).data;
      },
    } satisfies UseMutationOptions<DescriptionStopWordIn>;
  }
}

export const vacancyQuery = new VacancyQuery();
