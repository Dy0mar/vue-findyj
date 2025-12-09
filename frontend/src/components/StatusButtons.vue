<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import Select from "primevue/select";
import type { VacancyStatusType } from "src/types/models/vacancy/vacancy";
import { VacancyStatus } from "src/constants";

const route = useRoute();
const router = useRouter();
const statusSelected = ref<VacancyStatusType>();

onMounted(async () => {
  const found = statuses.find((item) => item.status === route.query.status);
  statusSelected.value = found ? found.status : VacancyStatus.NEW;
});

const statuses = [
  { label: "New", status: VacancyStatus.NEW },
  { label: "Interesting", status: VacancyStatus.INTERESTING },
  { label: "Later", status: VacancyStatus.NOT_INTERESTING },
  { label: "Applied", status: VacancyStatus.APPLIED },
];

watch(statusSelected, async (value) => {
  await router.replace({ query: { ...route.query, status: value } });
});
</script>

<template>
  <div class="block sm:hidden">
    <Select
      v-model="statusSelected"
      :options="statuses"
      option-label="label"
      option-value="status"
      size="small"
      class="bg-surface-700/30 border-surface-600 hover:border-pink-400"
      :pt="{
        option: {
          class: 'py-1 px-2',
        },
      }"
    />
  </div>
  <div class="hidden sm:flex space-x-4 items-center text-nowrap sm:p-2 rounded-lg">
    <Button
      v-for="{ status, label } in statuses"
      :key="status"
      type="button"
      :label="label"
      size="small"
      variant="outlined"
      :class="{
        'border-surface-600': route.query.status !== status,
        'border-pink-400': route.query.status === status,
      }"
      class="bg-surface-700/30 hover:border-pink-400 text-surface-400"
      @click="statusSelected = status"
    />
  </div>
</template>
