<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { crawlerClient } from "src/api/client/crawler";
import { categoryQuery } from "src/api/query/category";
import { EventNames, useBus } from "src/hooks/useBus";
import { useRequest } from "src/hooks/useRequest";
import { isMobile } from "src/utils/adaptive";
import StatusButtons from "src/components/StatusButtons.vue";
import CategoryButtons from "src/components/CategoryButtons.vue";

const route = useRoute();
const router = useRouter();

const term = ref<string>();
const timer = ref<NodeJS.Timeout>();
const bus = useBus();

const { data: categories_ } = useQuery(categoryQuery.categoryList());

const categories = computed<string[]>(() => {
  return categories_.value?.map(({ name }) => name) ?? [];
});

const { loading, requestAsync } = useRequest(() => {
  if (route.query.category) {
    return crawlerClient.runParse({ data: { category: String(route.query.category) } });
  }
  return crawlerClient.runParse();
});

async function runParse() {
  await requestAsync();
  bus.emit(EventNames.REFETCH_VACANCIES);
}

watch(term, async (value) => {
  clearTimeout(timer.value);
  timer.value = setTimeout(() => {
    // set undefined when empty to remove from query params
    router.replace({ query: { ...route.query, search: value || undefined } });
  }, 500);
});

const isMobile_ = isMobile();
</script>

<template>
  <div class="sticky top-0">
    <nav
      class="duration-300 dark:bg-zinc-800 transition-shadow bg-opacity-90 items-center w-full flex justify-between px-1.5 lg:pe-5 lg:ps-4 z-40"
    >
      <div class="flex items-center justify-between w-full h-16 gap-0 sm:gap-3">
        <div class="flex flex-row 3xl:flex-1 items-center items-centers space-x-2 sm:space-x-8">
          <h1 class="text-lg text-nowrap text-zinc-100 hidden sm:block">Job tracker</h1>
          <InputText
            v-model="term"
            placeholder="Search"
            size="small"
            class="bg-surface-700/30 hidden sm:block text-surface-100 border-surface-600 hover:border-pink-400 focus:border-pink-400 placeholder:text-surface-400 text-surface-300"
          />

          <StatusButtons />
          <CategoryButtons :categories="categories" />
        </div>

        <div class="flex items-center space-x-4">
          <Button
            icon="pi pi-refresh"
            type="button"
            :label="isMobile_ ? undefined : 'Fetch new'"
            size="small"
            variant="outlined"
            :loading="loading"
            class="bg-surface-700/30 border-surface-600 hover:border-pink-400 text-surface-400"
            @click="runParse"
          />
          <Button
            icon="pi pi-cog"
            type="button"
            :label="isMobile_ ? undefined : 'settings'"
            size="small"
            variant="outlined"
            class="bg-surface-700/30 border-surface-600 hover:border-pink-400 text-surface-400"
            @click="bus.emit(EventNames.OPEN_SETTINGS)"
          />
        </div>
      </div>
    </nav>
  </div>
</template>
