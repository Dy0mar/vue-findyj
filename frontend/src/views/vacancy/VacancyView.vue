<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import Drawer from "primevue/drawer";
import type { VacancyDetailOut } from "src/types/models/vacancy/vacancy";
import { VacancyStatus } from "src/constants";
import VacancyList from "src/views/vacancy/VacancyList.vue";

const route = useRoute();
const src = ref<VacancyDetailOut["link"]>();
const visible = ref(false);

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

// yes, I know it's not reactive, but I don't care.
const isMobile = window.innerWidth < 640;
</script>

<template>
  <div class="sm:w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-2 sm:p-6">
    <VacancyList
      v-if="category"
      :status="status"
      :category="category"
      :search="search"
      @selected="
        src = $event?.link;
        visible = true;
      "
    />
  </div>

  <div class="relative hidden sm:w-2/3 p-6 sm:flex flex-col">
    <iframe v-if="src" :src="src" width="100%" class="h-full w-full" frameborder="0" />
  </div>

  <Drawer v-if="isMobile" v-model:visible="visible" position="right" :show-close-icon="false">
    <iframe v-if="src" :src="src" width="100%" class="h-full w-full" frameborder="0" />
  </Drawer>

  <div>src {{ src }}</div>
</template>
