import { type Ref } from "vue";
import type { DescriptionStopWordIn, DescriptionStopWord } from "src/types/models/vacancy/vacancy";
import type { UseMutationOptions, UseQueryOptions } from "src/api/query/types";
import { stopWordsDescriptionClient } from "src/api/client/stop-words-description";
import { queryClient } from "src/queryClient";

const ROOT_QUERY_KEY = "api.stop-words.description";

const invalidateStopWordsTitleQueries = async () => {
  await queryClient.invalidateQueries({ queryKey: [ROOT_QUERY_KEY] });
};

class StopWordsDescriptionQuery {
  client = stopWordsDescriptionClient;

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
    } satisfies UseQueryOptions<DescriptionStopWord[], readonly [typeof ROOT_QUERY_KEY]>;
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
    } satisfies UseMutationOptions<DescriptionStopWordIn>;
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
    } satisfies UseMutationOptions<DescriptionStopWord["id"]>;
  }
}

export const stopWordsDescriptionQuery = new StopWordsDescriptionQuery();
