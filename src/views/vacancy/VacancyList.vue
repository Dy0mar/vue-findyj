<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { useInfiniteQuery, useMutation } from "@tanstack/vue-query";
import PButton from "primevue/button";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";
import { EventNames, useBus } from "src/hooks/useBus";
import { VacancyStatus } from "src/constants";
import { vacancyQuery } from "src/api/query/vacancy";
import VacancyCard from "src/views/vacancy/VacancyCard.vue";

const props = defineProps<{
  status: VacancyDetailOut["status"];
  category: VacancyDetailOut["category"];
  search?: string;
}>();

const emit = defineEmits<{
  (e: "selected", value: VacancyDetailOut | undefined): void;
}>();
const bus = useBus();

const selected = ref<VacancyDetailOut["v_id"]>();
const { mutateAsync: patchVacancy } = useMutation(vacancyQuery.patchVacancy());

const { data, fetchNextPage, refetch, isFetching } = useInfiniteQuery(
  vacancyQuery.vacanciesList(toRef(props, "status"), toRef(props, "category"), toRef(props, "search")),
);
bus.on(EventNames.REFETCH_VACANCIES, refetch);

const vacancies = computed<VacancyDetailOut[]>(() => {
  if (data.value) {
    return data.value.pages.map(({ items }) => items).flat();
  }
  return [];
});

async function changeStatus({ v_id, status }: { v_id: VacancyDetailOut["v_id"]; status: VacancyDetailOut["status"] }) {
  emit("selected", undefined);
  await patchVacancy({ v_id, status });
  await refetch();
}

async function handleVacancyClick(vacancy: VacancyDetailOut) {
  emit("selected", vacancy);
  selected.value = vacancy.v_id;

  if (!vacancy.read) {
    await patchVacancy({ v_id: vacancy.v_id, read: true });
    await refetch();
  }
}

const count = computed(() => (data.value ? data.value.pages[0].count : 0));
watch(count, (value) => {
  bus.emit(EventNames.COUNT_VACANCIES, value);
});
</script>

<template>
  <div class="space-y-4">
    <VacancyCard
      v-for="vacancy in vacancies"
      :key="vacancy.v_id"
      :vacancy="vacancy"
      @change-status="changeStatus"
      @click="handleVacancyClick(vacancy)"
      :class="[
        { 'bg-sky-300': vacancy.status === VacancyStatus.NEW && !vacancy.read && selected !== vacancy.v_id },
        { 'bg-sky-50': vacancy.status === VacancyStatus.NEW },
        { 'bg-red-200': vacancy.status === VacancyStatus.BANNED },
        { 'border border-pink-400': selected === vacancy.v_id },
      ]"
    />
    <PButton
      v-if="vacancies?.length < count && !isFetching"
      label="Load more"
      size="small"
      variant="outlined"
      class="bg-surface-200/30 border-surface-600 hover:border-pink-400 text-primary-900"
      @click="() => fetchNextPage()"
    />
    <div v-if="isFetching" class="text-center">Loading...</div>
  </div>
</template>
