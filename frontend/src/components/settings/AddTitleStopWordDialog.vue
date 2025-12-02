<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { useMessage } from "src/hooks/useMessage";
import { vacancyClient } from "src/api/client/vacancy";
import { vacancyQuery } from "src/api/query/vacancy";
import { useRequest } from "src/hooks/useRequest";
import { useBus, EventNames } from "src/hooks/useBus";
import AddDialog from "src/components/settings/AddDialog.vue";

const bus = useBus();
const { successMessage } = useMessage();

const { requestAsync: applyTitleStopWord } = useRequest(vacancyClient.applyTitleStopWord.bind(vacancyClient));

const visible = defineModel<boolean>("visible", { required: true });
const { mutateAsync: addTitleStopWord } = useMutation(vacancyQuery.addTitleStopWord());

async function saveTitle(word: string, apply = false) {
  if (word) {
    await addTitleStopWord({ word });
    if (apply) {
      await applyTitleStopWord();
      bus.emit(EventNames.REFETCH_VACANCIES);
    }
    visible.value = false;
    successMessage("Title stop word", "Title stop word added successfully");
  }
}
</script>

<template>
  <AddDialog
    v-model:visible="visible"
    header="Add title stop word"
    @save="saveTitle"
    @apply="(e) => saveTitle(e, true)"
  />
</template>
