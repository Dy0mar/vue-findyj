<script setup lang="ts">
import AppHeader from "src/layout/AppHeader.vue";
import AppFooter from "src/layout/AppFooter.vue";
</script>

<template>
  <div class="flex flex-col h-screen bg-sky-50 font-sans overflow-hidden">
    <AppHeader />
    <main class="flex flex-1 min-h-0">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
