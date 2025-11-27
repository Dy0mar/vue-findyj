<script setup lang="ts">
import { ref } from "vue";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { useQuery } from "@tanstack/vue-query";
import toast from "primevue/toast";
import { EventNames, useBus } from "src/hooks/useBus";
import { authQuery } from "src/api/query/auth";
import AppLayout from "src/layout/AppLayout.vue";
import VacancyView from "src/views/vacancy/VacancyView.vue";
import Settings from "src/components/settings/Settings.vue";
import AuthView from "src/views/auth/AuthView.vue";

const bus = useBus();
const visible = ref(false);
bus.on(EventNames.OPEN_SETTINGS, () => {
  visible.value = true;
});
const { isSuccess, isFetched } = useQuery(authQuery.check());
</script>

<template>
  <AppLayout v-if="isSuccess">
    <VacancyView />
    <Settings v-model:visible="visible" />
  </AppLayout>
  <AuthView v-else-if="isFetched" />
  <div v-else class="text-center">Loading...</div>
  <toast />
  <VueQueryDevtools button-position="bottom-right" />
</template>
