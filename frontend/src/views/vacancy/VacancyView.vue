<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";
import { VacancyStatus } from "src/constants";
import VacancyList from "src/views/vacancy/VacancyList.vue";

const route = useRoute();
const src = ref<VacancyDetailOut["link"]>();

const status = computed(() => {
  const { status } = route.query;
  const found = Object.values(VacancyStatus).find((s) => s === status);
  return found ? found : VacancyStatus.NEW;
});

const category = computed(() => {
  const { category } = route.query;
  if (category && !Array.isArray(category)) {
    return category;
  }
  return undefined;
});

const search = computed<string | undefined>(() => {
  if (!route.query.search) {
    return undefined;
  }
  if (Array.isArray(route.query.search)) {
    return String(route.query.search[0]);
  }
  return String(route.query.search);
});
</script>

<template>
  <div class="w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-6">
    <VacancyList
      v-if="category"
      :status="status"
      :category="category"
      :search="search"
      @selected="src = $event?.link"
    />
  </div>

  <div class="relative w-2/3 p-6 flex flex-col">
    <iframe v-if="src" :src="src" width="100%" class="h-full w-full" frameborder="0" />
  </div>
</template>
