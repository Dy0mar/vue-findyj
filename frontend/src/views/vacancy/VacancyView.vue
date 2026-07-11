<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import Drawer from "primevue/drawer";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";
import { isMobile } from "src/utils/adaptive";
import { VacancyStatus } from "src/constants";
import { vacancyQuery } from "src/api/query/vacancy";
import VacancyList from "src/views/vacancy/VacancyList.vue";

const route = useRoute();
const selected = ref<VacancyDetailOut>();
const visible = ref(false);
const selectedVId = ref<number | null>(null);
// yes, I know it's not reactive, but I don't care.
const isMobile_ = isMobile();

const { data: detailData, isFetching } = useQuery(vacancyQuery.vacancyDetail(selectedVId));

watch(detailData, (data) => {
  if (data?.full_description && selected.value) {
    selected.value = { ...selected.value, full_description: data.full_description };
  }
});

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

function onSelect(vacancy: VacancyDetailOut | undefined) {
  if (vacancy) {
    selected.value = vacancy;
    selectedVId.value = vacancy.v_id;
    visible.value = true;
  }
}
</script>

<template>
  <div class="w-full sm:w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-2 sm:p-6">
    <VacancyList v-if="category" :status="status" :category="category" :search="search" @selected="onSelect" />
  </div>

  <div class="relative hidden sm:w-2/3 p-6 sm:flex flex-col overflow-y-auto">
    <template v-if="selected">
      <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ selected.title }}</h2>
      <p class="text-sm text-gray-500 mb-3">{{ selected.date }}</p>
      <div class="text-gray-700 leading-relaxed whitespace-pre-line">
        <span v-if="isFetching" class="text-gray-400 italic">Loading...</span>
        <span v-else>{{ selected.full_description || "No description yet" }}</span>
      </div>
    </template>
    <div v-else class="flex items-center justify-center h-full text-gray-400 text-lg">Select a vacancy</div>
  </div>

  <Drawer v-if="isMobile_" v-model:visible="visible" position="right" :show-close-icon="false">
    <template v-if="selected">
      <h2 class="text-xl font-bold text-gray-800 mb-2">{{ selected.title }}</h2>
      <p class="text-sm text-gray-500 mb-3">{{ selected.date }}</p>
      <div class="text-gray-700 leading-relaxed whitespace-pre-line">
        <span v-if="isFetching" class="text-gray-400 italic">Loading...</span>
        <span v-else>{{ selected.full_description || "No description yet" }}</span>
      </div>
    </template>
  </Drawer>
</template>
