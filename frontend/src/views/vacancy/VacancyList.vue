<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { useInfiniteQuery, useMutation } from "@tanstack/vue-query";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";
import { EventNames, useBus } from "src/hooks/useBus";
import { useMessage } from "src/hooks/useMessage";
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
const { successMessage } = useMessage();

const selected = ref<VacancyDetailOut>();
const { mutateAsync: patchVacancy } = useMutation(vacancyQuery.patchVacancy());

const { data, fetchNextPage, refetch, isFetching } = useInfiniteQuery(
  vacancyQuery.vacanciesList(toRef(props, "status"), toRef(props, "category"), toRef(props, "search")),
);
/**
 * Subscribe on bus event to refresh the vacancy list
 */
bus.on(EventNames.REFETCH_VACANCIES, async () => {
  await refetch();
  successMessage("Refresh success", "Vacancies refreshed successfully");
});

const vacancies = computed<VacancyDetailOut[]>(() => {
  if (data.value) {
    return data.value.pages.map(({ items }) => items).flat();
  }
  return [];
});

/**
 * Change vacancy status
 */
async function changeStatus({ v_id, status }: VacancyDetailOut) {
  selected.value = undefined;
  await patchVacancy({ v_id, status });
  successMessage("Status change", "Vacancy status changed successfully");
}

/**
 * Handle vacancy click event
 */
async function handleVacancyClick(vacancy: VacancyDetailOut) {
  selected.value = vacancy;

  if (!vacancy.read) {
    await patchVacancy({ v_id: vacancy.v_id, read: true });
  }
}

const count = computed(() => (data.value && data.value.pages[0] ? data.value.pages[0].count : 0));

watch(count, (value) => {
  bus.emit(EventNames.COUNT_VACANCIES, value);
});

watch(selected, (value) => {
  emit("selected", value);
});
</script>

<template>
  <div class="space-y-4">
    <TransitionGroup name="slide-left" tag="div" class="space-y-4">
      <VacancyCard
        v-for="vacancy in vacancies"
        :key="vacancy.v_id"
        :vacancy="vacancy"
        @change-status="changeStatus"
        @click="handleVacancyClick(vacancy)"
        :class="[
          { 'bg-sky-300': vacancy.status === VacancyStatus.NEW && !vacancy.read && selected?.v_id !== vacancy.v_id },
          { 'bg-sky-50': vacancy.status === VacancyStatus.NEW && selected?.v_id !== vacancy.v_id },
          { 'bg-red-200': vacancy.status === VacancyStatus.BANNED && selected?.v_id !== vacancy.v_id },
          { 'border border-pink-600 bg-pink-200': selected?.v_id === vacancy.v_id },
        ]"
      />
    </TransitionGroup>
    <Button
      v-if="vacancies?.length < count && !isFetching"
      label="Load more"
      size="small"
      variant="outlined"
      class="bg-surface-200/30 border-surface-600 hover:border-pink-400 text-primary-900"
      @click="() => fetchNextPage()"
    />

    <div class="flex justify-center">
      <ProgressSpinner class="h-10 w-10" />
    </div>
  </div>
</template>
