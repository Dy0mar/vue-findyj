<script setup lang="ts">
import { useRoute } from "vue-router";
import { useMutation } from "@tanstack/vue-query";
import { useMessage } from "src/hooks/useMessage";
import { stopWordsDescriptionQuery } from "src/api/query/stop-words-description";
import { useRequest } from "src/hooks/useRequest";
import { stopWordsDescriptionClient } from "src/api/client/stop-words-description";
import { EventNames, useBus } from "src/hooks/useBus";
import AddDialog from "src/components/settings/AddDialog.vue";

const route = useRoute();
const bus = useBus();
const { successMessage } = useMessage();

const { requestAsync: applyDescriptionStopWord } = useRequest(() => {
  if (route.query.category) {
    return stopWordsDescriptionClient.apply({ data: { category: String(route.query.category) } });
  }
  return stopWordsDescriptionClient.apply();
});

const visible = defineModel<boolean>("visible", { required: true });
const { mutateAsync } = useMutation(stopWordsDescriptionQuery.create());

async function save(word: string, apply = false) {
  if (word) {
    await mutateAsync({ word });
    if (apply) {
      await applyDescriptionStopWord();
      bus.emit(EventNames.REFETCH_VACANCIES);
    }
    visible.value = false;
    successMessage("Description stop word", "Description stop word added successfully");
  }
}
</script>

<template>
  <AddDialog v-model:visible="visible" header="Add description stop word" @save="save" @apply="(e) => save(e, true)" />
</template>
