<script setup lang="ts">
import { useMutation } from "@tanstack/vue-query";
import { useMessage } from "src/hooks/useMessage";
import { stopWordsTitleClient } from "src/api/client/stop-words-title";
import { stopWordsTitleQuery } from "src/api/query/stop-words-title";
import { useRequest } from "src/hooks/useRequest";
import { useBus, EventNames } from "src/hooks/useBus";
import AddDialog from "src/components/settings/AddDialog.vue";

const bus = useBus();
const { successMessage } = useMessage();

const { requestAsync: applyTitleStopWord } = useRequest(stopWordsTitleClient.apply.bind(stopWordsTitleClient));

const visible = defineModel<boolean>("visible", { required: true });
const { mutateAsync: addTitleStopWord } = useMutation(stopWordsTitleQuery.create());

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
