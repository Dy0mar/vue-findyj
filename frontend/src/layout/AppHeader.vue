<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { crawlerClient } from "src/api/client/crawler";
import { categoryQuery } from "src/api/query/category";
import { EventNames, useBus } from "src/hooks/useBus";
import { useRequest } from "src/hooks/useRequest";
import { VacancyStatus } from "src/constants";

const route = useRoute();
const router = useRouter();

const term = ref<string>();
const timer = ref<NodeJS.Timeout>();
const bus = useBus();

onMounted(async () => {
  const { status } = route.query;
  if (!statuses.find((item) => item.status === status)) {
    await router.replace({ query: { status: VacancyStatus.NEW } });
  }
});
const { data: categories_ } = useQuery(categoryQuery.categoryList());

const categories = computed(() => {
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

const statuses: { label: string; status: VacancyStatus }[] = [
  { label: "New", status: VacancyStatus.NEW },
  { label: "Interesting", status: VacancyStatus.INTERESTING },
  { label: "Later", status: VacancyStatus.NOT_INTERESTING },
  { label: "Applied", status: VacancyStatus.APPLIED },
];

watch(term, async (value) => {
  clearTimeout(timer.value);
  timer.value = setTimeout(() => {
    // set undefined when empty to remove from query params
    router.replace({ query: { ...route.query, search: value || undefined } });
  }, 500);
});

watch(categories, async (value) => {
  if (value) {
    const foundStatus = statuses.find((item) => item.status === route.query.status);
    const status = foundStatus ? foundStatus.status : VacancyStatus.NEW;
    await router.replace({ query: { ...route.query, status, category: value[0] } });
  }
});
</script>

<template>
  <div class="sticky top-0">
    <nav
      class="duration-300 dark:bg-zinc-800 transition-shadow bg-opacity-90 items-center w-full flex justify-between px-1.5 lg:pe-5 lg:ps-4 z-40"
    >
      <div class="flex items-center justify-between w-full h-16 gap-0 sm:gap-3">
        <div class="flex flex-row 3xl:flex-1 items-center items-centers space-x-8">
          <h1 class="text-lg text-nowrap text-zinc-100">Job tracker</h1>
          <InputText
            v-model="term"
            placeholder="Search"
            size="small"
            class="bg-surface-700/30 text-surface-100 border-surface-600 hover:border-pink-400 focus:border-pink-400 placeholder:text-surface-400 text-surface-300"
          />

          <div class="flex space-x-4 items-center text-nowrap p-2 rounded-lg">
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
              @click="router.replace({ query: { ...route.query, status: status } })"
            />
          </div>

          <div class="flex space-x-4 items-center text-nowrap p-2 rounded-lg">
            <Button
              v-for="category in categories"
              :key="category"
              type="button"
              :label="category"
              size="small"
              variant="outlined"
              :class="{
                'border-surface-600': route.query.category !== category,
                'border-pink-400': route.query.category === category,
              }"
              class="bg-surface-700/30 hover:border-pink-400 text-surface-400"
              @click="router.replace({ query: { ...route.query, category } })"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <Button
            type="button"
            label="Fetch new"
            size="small"
            variant="outlined"
            :loading="loading"
            class="bg-surface-700/30 border-surface-600 hover:border-pink-400 text-surface-400"
            @click="runParse"
          />
          <Button
            type="button"
            label="settings"
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
