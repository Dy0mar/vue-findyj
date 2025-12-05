import { type Ref } from "vue";
import type { TitleStopWordIn, TitleStopWord } from "src/types/models/vacancy/vacancy";
import type { UseMutationOptions, UseQueryOptions } from "src/api/query/types";
import { stopWordsTitleClient } from "src/api/client/stop-words-title";
import { queryClient } from "src/queryClient";

const ROOT_QUERY_KEY = "api.stop-words.title";

const invalidateStopWordsTitleQueries = async () => {
  await queryClient.invalidateQueries({ queryKey: [ROOT_QUERY_KEY] });
};

class StopWordsTitleQuery {
  client = stopWordsTitleClient;

  /**
   * List of title stop words
   */
  list(enabled: Ref<boolean>) {
    return {
      staleTime: Infinity,
      enabled,
      queryKey: [ROOT_QUERY_KEY],
      queryFn: async () => {
        return (await this.client.list()).data;
      },
    } satisfies UseQueryOptions<TitleStopWord[], readonly [typeof ROOT_QUERY_KEY]>;
  }

  /**
   * Add title stop word
   */
  create() {
    return {
      mutationFn: async (data) => {
        return (await this.client.create({ data })).data;
      },
      onSuccess: invalidateStopWordsTitleQueries,
    } satisfies UseMutationOptions<TitleStopWordIn>;
  }

  /**
   * Remove title stop word by id
   */
  delete() {
    return {
      mutationFn: async (id) => {
        return (await this.client.delete({ params: { id } })).data;
      },
      onSuccess: invalidateStopWordsTitleQueries,
    } satisfies UseMutationOptions<TitleStopWord["id"]>;
  }
}

export const stopWordsTitleQuery = new StopWordsTitleQuery();
