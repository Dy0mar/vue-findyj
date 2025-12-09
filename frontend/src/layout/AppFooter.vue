<script setup lang="ts">
import { ref } from "vue";
import { EventNames, useBus } from "src/hooks/useBus";

const bus = useBus();
const count = ref(0);
bus.on(EventNames.COUNT_VACANCIES, (value) => {
  count.value = value;
});
</script>

<template>
  <footer class="mt-auto py-2 dark:bg-zinc-800 transition-shadow bg-opacity-90 duration-300">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 text-center text-zinc-100/90">
      <div class="flex items-center justify-between">
        <div>Vacancies: {{ count }}</div>
        <div>&copy; {{ new Date().getFullYear() }} Find Your Job</div>
        <div></div>
      </div>
    </div>
  </footer>
</template>
