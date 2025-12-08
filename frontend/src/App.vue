<script setup lang="ts">
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import Toast from "primevue/toast";
</script>

<template>
  <router-view />
  <Toast position="bottom-right" />
  <VueQueryDevtools button-position="bottom-right" />
</template>
