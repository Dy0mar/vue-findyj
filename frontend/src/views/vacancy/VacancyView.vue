<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import Drawer from "primevue/drawer";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";
import { isMobile } from "src/utils/adaptive";
import { VacancyStatus } from "src/constants";
import VacancyList from "src/views/vacancy/VacancyList.vue";

const route = useRoute();
const selected = ref<VacancyDetailOut>();
const visible = ref(false);
// yes, I know it's not reactive, but I don't care.
const isMobile_ = isMobile();

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

async function onSelect(vacancy: VacancyDetailOut | undefined) {
  if (!vacancy) return;
  selected.value = vacancy;
  visible.value = true;

  if (vacancy.full_description) return;

  const u = new URL(vacancy.link);
  const company = u.pathname.match(/companies\/([^/]+)\/vacancies/)?.[1];
  if (!company) {
    console.warn("Cannot parse company from link", vacancy.link);
    return;
  }
  const exportUrl = `${u.origin}/companies/${company}/vacancies/export/`;
  const resp = await fetch(exportUrl, {
    headers: {
      "Accept": "*/*",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Referer": `${u.origin}/`,
    },
  });
  if (!resp.ok) {
    console.warn("export fetch failed", resp.status);
    return;
  }
  const items = await resp.json();
  console.log("export items:", items);
  const match = items.find((i: { link: string }) => i.link === vacancy.link);
  console.log("matched vacancy:", match);
  if (match?.description) {
    selected.value = { ...selected.value, full_description: match.description };
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
        <span>{{ selected.full_description || "No description yet" }}</span>
      </div>
    </template>
    <div v-else class="flex items-center justify-center h-full text-gray-400 text-lg">Select a vacancy</div>
  </div>

  <Drawer v-if="isMobile_" v-model:visible="visible" position="right" :show-close-icon="false">
    <template v-if="selected">
      <h2 class="text-xl font-bold text-gray-800 mb-2">{{ selected.title }}</h2>
      <p class="text-sm text-gray-500 mb-3">{{ selected.date }}</p>
      <div class="text-gray-700 leading-relaxed whitespace-pre-line">
        <span>{{ selected.full_description || "No description yet" }}</span>
      </div>
    </template>
  </Drawer>
</template>
