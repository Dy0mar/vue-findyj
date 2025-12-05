<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useMutation, useQuery } from "@tanstack/vue-query";
import type { StopWord } from "src/types/models/vacancy/vacancy";
import { useMessage } from "src/hooks/useMessage";
import { stopWordsDescriptionQuery } from "src/api/query/stop-words-description";
import StopWordDriver from "src/components/settings/StopWordDriver.vue";

const { successMessage } = useMessage();

const visible = defineModel<boolean>("visible", { required: true });

const { data: stopWords_ } = useQuery(stopWordsDescriptionQuery.list(visible));
const stopWords = computed(() => stopWords_.value ?? []);

const { mutateAsync: removeStopWord, isPending, isSuccess } = useMutation(stopWordsDescriptionQuery.delete());

const remove = async (item: StopWord) => {
  await removeStopWord(item.id);
};
watchEffect(() => {
  if (!isPending.value && isSuccess.value) {
    successMessage("Removed", "Item has been removed");
  }
});
</script>

<template>
  <StopWordDriver v-model:visible="visible" :items="stopWords" header="Description" @remove="remove" />
</template>
