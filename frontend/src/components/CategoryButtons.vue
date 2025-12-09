<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Button from "primevue/button";
import Select from "primevue/select";

const { categories } = defineProps<{
  categories: string[];
}>();
const route = useRoute();
const router = useRouter();
const categorySelected = ref<string>();

const unwatch = watch(
  () => categories,
  (value) => {
    if (value.length) {
      const category = route.query.category && !Array.isArray(route.query.category) ? route.query.category : undefined;
      const found = value.find((c) => c === category);
      categorySelected.value = found ? found : value[0];
      unwatch();
    }
  },
);

watch(categorySelected, async (value) => {
  await router.replace({ query: { ...route.query, category: value } });
});
</script>

<template>
  <div class="block sm:hidden">
    <Select
      v-model="categorySelected"
      :options="categories"
      size="small"
      class="bg-surface-700/30 border-surface-600 hover:border-pink-400"
      :pt="{
        option: {
          class: 'py-1 px-2',
        },
      }"
    />
  </div>

  <div class="hidden sm:flex space-x-1 sm:space-x-4 items-center text-nowrap p-2 rounded-lg">
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
      @click="categorySelected = category"
    />
  </div>
</template>
