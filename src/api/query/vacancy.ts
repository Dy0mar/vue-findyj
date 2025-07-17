import type { AxiosResponse } from "axios";
import type { Ref } from "vue";
import type { Paginated } from "src/types/models/extra";
import type {
  VacancyDetailOut,
  TitleStopWordIn,
  DescriptionStopWordIn,
  VacancyIn,
} from "src/types/models/vacancy/vacancy";
import type { UseInfiniteQueryOptions, UseMutationOptions } from "src/api/query/types";
import { vacancyClient } from "src/api/client/vacancy";
import { queryClient } from "src/queryClient";

const LIST_QUERY_KEY = "api.vacancies";
type VacancyListQueryKey = readonly [
  typeof LIST_QUERY_KEY,
  VacancyDetailOut["status"],
  VacancyDetailOut["category"],
  string | undefined,
];

class VacancyQuery {
  client = vacancyClient;
  PER_PAGE = 10;

  /**
   * List of all vacancies
   */
  vacanciesList(
    status: Ref<VacancyDetailOut["status"]>,
    category: Ref<VacancyDetailOut["category"]>,
    search: Ref<string | undefined>,
  ) {
    return {
      queryKey: ["api.vacancies", status, category, search],
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
      onMutate: ({ v_id, status, read }) => {
        queryClient.setQueryData([LIST_QUERY_KEY], (oldData?: VacancyDetailOut[]) => {
          return (oldData || []).map((item) => {
            if (status !== undefined) {
              return item.v_id === v_id ? { ...item, status } : item;
            }
            return item.v_id === v_id ? { ...item, read } : item;
          });
        });
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
